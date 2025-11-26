-- Verify User table has the new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('paymentStatus', 'lastPaymentDate', 'nextPaymentDue', 'allowedNavigation', 'role', 'status', 'phone')
ORDER BY column_name;
