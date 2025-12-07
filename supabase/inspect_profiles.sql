-- Inspect profiles table schema
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'profiles';

-- Check for constraints (like unique username)
SELECT 
    conname as constraint_name, 
    contype as constraint_type, 
    pg_get_constraintdef(c.oid) as definition
FROM 
    pg_constraint c 
JOIN 
    pg_namespace n ON n.oid = c.connamespace 
WHERE 
    n.nspname = 'public' AND 
    conrelid::regclass::text = 'profiles';

-- Check RLS policies
SELECT 
    policyname, 
    cmd, 
    qual, 
    with_check 
FROM 
    pg_policies 
WHERE 
    tablename = 'profiles';
