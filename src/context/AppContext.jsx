import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULTS, buildInitialMatches } from '../constants/data';

const AppContext = createContext(null);

const DEFAULT_SPECIALS = {
  champion: '', runnerup: '',
  darkhorse_team: '', darkhorse_round: '',
  fastest_team: '', fastest_minute: '',
  mostscored: '', mostconceded: '',
};

export function AppProvider({ children }) {
  const [people, setPeople] = useState([]);
  const [matches, setMatches] = useState([]);
  const [specials, setSpecials] = useState(DEFAULT_SPECIALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: pData, error: pErr }, { data: mData, error: mErr }, { data: sData, error: sErr }] =
        await Promise.all([
          supabase.from('people').select('*').order('sort_order'),
          supabase.from('matches').select('*'),
          supabase.from('specials').select('*').eq('id', 1).single(),
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

  useEffect(() => {
    loadAll();

    const matchSub = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload) => {
        setMatches((prev) => prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)));
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
      supabase.removeChannel(specialsSub);
      supabase.removeChannel(peopleSub);
    };
  }, [loadAll]);

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
      const sortOrder = people.length;
      const { data } = await supabase.from('people').insert({
        name: person.name, teams: person.teams, tier: person.tier, sort_order: sortOrder,
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
      people, matches, specials, loading, error,
      updateMatchScore, updateSpecials, savePerson, removePerson, reload: loadAll,
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
