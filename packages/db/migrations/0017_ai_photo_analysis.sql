-- Create photo_analysis table to store AI-generated metadata
CREATE TABLE IF NOT EXISTS public.photo_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    visual_description TEXT,
    tags TEXT[] DEFAULT '{}',
    detected_objects JSONB DEFAULT '[]',
    detected_faces JSONB DEFAULT '[]',
    analysis_provider TEXT DEFAULT 'gemini-pro-vision',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(photo_id)
);

-- Enable RLS
ALTER TABLE public.photo_analysis ENABLE ROW LEVEL SECURITY;

-- RLS: Family members can view analysis
CREATE POLICY "Family members can view photo analysis"
    ON public.photo_analysis
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = photo_analysis.family_id
            AND members.profile_id = auth.uid()
        )
    );

-- RLS: Only system/edge functions should insert/update (simplifying for now to allow authenticated triggers if needed)
CREATE POLICY "Allow system insertions via shared family access"
    ON public.photo_analysis
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = photo_analysis.family_id
            AND members.profile_id = auth.uid()
        )
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_photo_analysis_photo_id ON public.photo_analysis(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_analysis_family_id ON public.photo_analysis(family_id);
CREATE INDEX IF NOT EXISTS idx_photo_analysis_tags ON public.photo_analysis USING GIN(tags);

-- Grant permissions
GRANT ALL ON public.photo_analysis TO authenticated;
GRANT ALL ON public.photo_analysis TO service_role;
