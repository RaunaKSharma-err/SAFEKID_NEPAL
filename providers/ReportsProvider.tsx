import { broadcastAlert } from "@/lib/sms";
import { supabase } from "@/lib/supabase";
import type { MissingChildReport, Sighting } from "@/types/report";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

export const [ReportsProvider, useReports] = createContextHook(() => {
  const [reports, setReports] = useState<MissingChildReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, updateTokens } = useAuth();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*, sightings(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Supabase gives flat objects, map into your type
      const formatted = (data || []).map((r) => ({
        ...r,
        lastSeenCoordinates: r.last_seen_lat
          ? { latitude: r.last_seen_lat, longitude: r.last_seen_lng }
          : undefined,
        sightings: r.sightings || [],
      })) as MissingChildReport[];

      setReports(formatted);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const createReport = useCallback(
    async (
      report: Omit<MissingChildReport, "id" | "created_at" | "sightings">
    ) => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .insert({
            parent_id: report.parentId,
            parent_name: report.parentName,
            parent_phone: report.parentPhone,
            child_name: report.child_name,
            child_age: report.childAge,
            child_photo: report.childPhoto,
            description: report.description,
            last_seen_location: report.lastSeenLocation,
            last_seen_lat: report.lastSeenCoordinates?.latitude,
            last_seen_lng: report.lastSeenCoordinates?.longitude,
            broadcast_area: report.broadcastArea,
            cost: report.cost,
            status: report.status,
          })
          .select("*, sightings(*)")
          .single();

        if (error) throw error;

        const newReport: MissingChildReport = {
          ...data,
          lastSeenCoordinates: data.last_seen_lat
            ? { latitude: data.last_seen_lat, longitude: data.last_seen_lng }
            : undefined,
          sightings: [],
        };

        setReports((prev) => [newReport, ...prev]);

        // Broadcast SMS/WhatsApp
        await broadcastAlert(newReport, report.broadcastArea);

        return newReport;
      } catch (error) {
        console.error("Create report error:", error);
        throw error;
      }
    },
    []
  );

  const addSighting = useCallback(
    async (
      reportId: string,
      sighting: Omit<
        Sighting,
        "id" | "createdAt" | "tokensEarned" | "isVerified"
      >
    ) => {
      try {
        const { data, error } = await supabase
          .from("sightings")
          .insert({
            report_id: reportId,
            submitter_id: sighting.submitterId,
            submitter_name: sighting.submitterName,
            submitter_phone: sighting.submitterPhone,
            photo: sighting.photo,
            description: sighting.description,
            location: sighting.location,
            latitude: sighting.coordinates?.latitude,
            longitude: sighting.coordinates?.longitude,
          })
          .select()
          .single();

        if (error) throw error;

        const newSighting: Sighting = {
          ...data,
          coordinates: data.latitude
            ? { latitude: data.latitude, longitude: data.longitude }
            : undefined,
        };

        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? { ...report, sightings: [...report.sightings, newSighting] }
              : report
          )
        );

        // reward tokens
        if (user && sighting.submitterId === user.id) {
          await updateTokens(user.tokens + (data.tokens_earned || 10));
        }

        return newSighting;
      } catch (error) {
        console.error("Add sighting error:", error);
        throw error;
      }
    },
    [user, updateTokens]
  );

  const markAsFound = useCallback(async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: "found", found_at: new Date().toISOString() })
        .eq("id", reportId);

      if (error) throw error;

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: "found", foundAt: new Date().toISOString() }
            : r
        )
      );
    } catch (error) {
      console.error("Mark as found error:", error);
    }
  }, []);

  const getMyReports = useCallback(() => {
    if (!user) return [];
    return reports.filter((report) => report.parentId === user.id);
  }, [reports, user]);

  const getActiveReports = useCallback(() => {
    return reports.filter((report) => report.status === "active");
  }, [reports]);

  return useMemo(
    () => ({
      reports,
      loading,
      createReport,
      addSighting,
      markAsFound,
      getMyReports,
      getActiveReports,
      loadReports,
    }),
    [
      reports,
      loading,
      createReport,
      addSighting,
      markAsFound,
      getMyReports,
      getActiveReports,
    ]
  );
});
