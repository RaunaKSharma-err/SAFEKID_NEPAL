export const supabase = {
  auth: {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return { data: null, error: null };
    },
    signUp: async (credentials: { email: string; password: string }) => {
      return { data: null, error: null };
    },
    signOut: async () => {
      return { error: null };
    },
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({ data: [], error: null }),
    }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
};