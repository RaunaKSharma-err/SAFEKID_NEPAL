import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MissingChildReport, Sighting } from '@/types/report';
import { broadcastAlert } from '@/lib/sms';
import { useAuth } from './AuthProvider';

export const [ReportsProvider, useReports] = createContextHook(() => {
  const [reports, setReports] = useState<MissingChildReport[]>([]);
  const [loading, setLoading] = useState(true);
  const authContext = useAuth();
  const { user, updateTokens } = authContext || { user: null, updateTokens: () => {} };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const stored = await AsyncStorage.getItem('reports');
      if (stored) {
        setReports(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReports = async (newReports: MissingChildReport[]) => {
    try {
      await AsyncStorage.setItem('reports', JSON.stringify(newReports));
      setReports(newReports);
    } catch (error) {
      console.error('Failed to save reports:', error);
    }
  };

  const createReport = useCallback(async (report: Omit<MissingChildReport, 'id' | 'createdAt' | 'sightings'>) => {
    const newReport: MissingChildReport = {
      ...report,
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString(),
      sightings: [],
    };

    const updatedReports = [newReport, ...reports];
    await saveReports(updatedReports);

    await broadcastAlert(newReport, report.broadcastArea);

    return newReport;
  }, [reports]);

  const addSighting = useCallback(async (reportId: string, sighting: Omit<Sighting, 'id' | 'createdAt' | 'tokensEarned' | 'isVerified'>) => {
    const tokensEarned = 10;
    
    const newSighting: Sighting = {
      ...sighting,
      id: `sighting_${Date.now()}`,
      createdAt: new Date().toISOString(),
      tokensEarned,
      isVerified: false,
    };

    const updatedReports = reports.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          sightings: [...report.sightings, newSighting],
        };
      }
      return report;
    });

    await saveReports(updatedReports);

    if (user && sighting.submitterId === user.id) {
      await updateTokens(user.tokens + tokensEarned);
    }

    return newSighting;
  }, [reports, user, updateTokens]);

  const markAsFound = useCallback(async (reportId: string) => {
    const updatedReports = reports.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          status: 'found' as const,
          foundAt: new Date().toISOString(),
        };
      }
      return report;
    });

    await saveReports(updatedReports);
  }, [reports]);

  const getMyReports = useCallback(() => {
    if (!user) return [];
    return reports.filter(report => report.parentId === user.id);
  }, [reports, user]);

  const getActiveReports = useCallback(() => {
    return reports.filter(report => report.status === 'active');
  }, [reports]);

  return useMemo(() => ({
    reports,
    loading,
    createReport,
    addSighting,
    markAsFound,
    getMyReports,
    getActiveReports,
  }), [reports, loading, createReport, addSighting, markAsFound, getMyReports, getActiveReports]);
});