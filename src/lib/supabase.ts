import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kyonlfvtwtunypbumtju.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5b25sZnZ0d3R1bnlwYnVtdGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDQyNjksImV4cCI6MjA5NDA4MDI2OX0.7D-yaAsgPEbmNfcm9LKRD5nqWsn-Vw43S7dvNDuS4bs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
