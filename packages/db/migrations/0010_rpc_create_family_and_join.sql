-- Create atomic RPC function to create a family and join as admin
CREATE OR REPLACE FUNCTION public.create_family_and_join(p_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_family_id uuid;
    v_user_id uuid;
BEGIN
    -- Get the authenticated user ID
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Insert into families
    INSERT INTO families (name, created_by)
    VALUES (p_name, v_user_id)
    RETURNING id INTO v_family_id;

    -- Insert into members as admin
    INSERT INTO members (family_id, profile_id, role)
    VALUES (v_family_id, v_user_id, 'admin');

    RETURN v_family_id;
END;
$$;

-- Secure the function permissions (Only authenticated users can execute)
REVOKE ALL ON FUNCTION public.create_family_and_join(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_family_and_join(text) TO authenticated;
