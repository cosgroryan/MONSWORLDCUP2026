import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { syncMatchScores } from '../lib/footballApi';
import { DEFAULTS, buildInitialMatches } from '../constants/data';

const AppContext = createContext(null);

const DEFAULT_SPECIALS = {
  champion: '', runnerup: '',
  darkhorse_team: '', darkhorse_round: '',
  fastest_team: '', fastest_minute: '',
  mostscored: '', mostconceded: '',
};

export function AppProvider({ children }) {
  const [people, setPeople]       = useState([]);
  const [matches, setMatches]     = useState([]);
  const [koMatches, setKoMatches] = useState([]);
  const [specials, setSpecials]   = useState(DEFAULT_SPECIALS);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [syncStatus, setSyncStatus] = useState({ syncing: false, newScores: null, error: null });
  const didAutoSync = useRef(false);

  // ── Load from Supabase, seed if empty ─────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: pData, error: pErr },
        { data: mData, error: mErr },
        { data: sData, error: sErr },
        { data: kData },
      ] = await Promise.all([
        supabase.from('people').select('*').order('sort_order'),
        supabase.from('matches').select('*'),
        supabase.from('specials').select('*').eq('id', 1).single(),
        supabase.from('ko_matches').select('*').order('match_order'),
      ]);

      if (pErr) throw pErr;
      if (mErr) throw mErr;

      if (!pData || pData.length === 0) {
        const toInsert = DEFAULTS.map((p, i) => ({ name: p.name, teams: p.teams, tier: p.tier, sort_order: i }));
        const { data: seeded } = await supabase.from('people').insert(toInsert).select();
        setPeople(seeded || DEFAULTS);
      } else {
        setPeople(pData);
      }

      if (!mData || mData.length === 0) {
        const initialMatches = buildInitialMatches();
        const { data: seeded } = await supabase.from('matches').insert(initialMatches).select();
        setMatches(seeded || initialMatches);
      } else {
        setMatches(mData);
      }

      if (kData) setKoMatches(kData);

      if (sErr || !sData) {
        await supabase.from('specials').upsert({ id: 1, ...DEFAULT_SPECIALS });
        setSpecials(DEFAULT_SPECIALS);
      } else {
        setSpecials({ ...DEFAULT_SPECIALS, ...sData });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-sync scores once on first load ───────────────────────────
  const runSync = useCallback(async () => {
    setSyncStatus({ syncing: true, newScores: null, error: null });
    try {
      const result = await syncMatchScores();
      // Re-fetch matches so local state reflects what was written to DB
      if (result.updated > 0) {
        const [{ data: mNew }, { data: kNew }] = await Promise.all([
          supabase.from('matches').select('*'),
          supabase.from('ko_matches').select('*').order('match_order'),
        ]);
        if (mNew) setMatches(mNew);
        if (kNew) setKoMatches(kNew);
      }
      setSyncStatus({ syncing: false, newScores: result.updated, error: null });
      // Clear the count after 5 s so it doesn't linger
      setTimeout(() => setSyncStatus(s => ({ ...s, newScores: null })), 5000);
    } catch (e) {
      setSyncStatus({ syncing: false, newScores: null, error: e.message });
      setTimeout(() => setSyncStatus(s => ({ ...s, error: null })), 6000);
    }
  }, []);

  useEffect(() => {
    // Load DB first, then auto-sync once
    loadAll().then(() => {
      if (!didAutoSync.current) {
        didAutoSync.current = true;
        runSync();
      }
    });

    // Realtime subscriptions
    const matchSub = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload) => {
        setMatches((prev) => prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)));
      })
      .subscribe();

    const koSub = supabase
      .channel('ko-matches-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ko_matches' }, (payload) => {
        setKoMatches((prev) => prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)));
      })
      .subscribe();

    const specialsSub = supabase
      .channel('specials-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'specials' }, (payload) => {
        setSpecials((prev) => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    const peopleSub = supabase
      .channel('people-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, () => {
        supabase.from('people').select('*').order('sort_order').then(({ data }) => {
          if (data) setPeople(data);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(matchSub);
      supabase.removeChannel(koSub);
      supabase.removeChannel(specialsSub);
      supabase.removeChannel(peopleSub);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMatchScore = useCallback(async (id, hg, ag) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, hg, ag } : m)));
    await supabase.from('matches').update({ hg, ag }).eq('id', id);
  }, []);

  const updateSpecials = useCallback(async (updates) => {
    setSpecials((prev) => ({ ...prev, ...updates }));
    await supabase.from('specials').update(updates).eq('id', 1);
  }, []);

  const savePerson = useCallback(async (person) => {
    if (person.id) {
      const { data } = await supabase.from('people').update({
        name: person.name, teams: person.teams, tier: person.tier,
      }).eq('id', person.id).select().single();
      if (data) setPeople((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else {
      const { data } = await supabase.from('people').insert({
        name: person.name, teams: person.teams, tier: person.tier, sort_order: people.length,
      }).select().single();
      if (data) setPeople((prev) => [...prev, data]);
    }
  }, [people.length]);

  const removePerson = useCallback(async (id) => {
    await supabase.from('people').delete().eq('id', id);
    setPeople((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      people, matches, koMatches, specials, loading, error, syncStatus,
      updateMatchScore, updateSpecials, savePerson, removePerson,
      reload: loadAll, manualSync: runSync,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
