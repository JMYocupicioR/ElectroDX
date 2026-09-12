-- Relax foreign key on content_revisions to allow updating static topics
-- that have not been inserted into published_topics yet.
ALTER TABLE public.content_revisions DROP CONSTRAINT IF EXISTS content_revisions_target_topic_id_fkey;
