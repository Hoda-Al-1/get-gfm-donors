DECLARE 
    @PersonId INT,
    @Name NVARCHAR(500),
    @NewFilteredName NVARCHAR(500);

DECLARE curPersons CURSOR LOCAL FAST_FORWARD FOR
SELECT Id, Name
FROM DR_Persons
WHERE FilteredName LIKE N'%[áàäâãåāçčćéèëêēíìïîīñńóòöôõøōúùüûūýÿšśžźżæœß]%';

OPEN curPersons;

FETCH NEXT FROM curPersons INTO @PersonId, @Name;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @NewFilteredName = dbo.ReplaceNonEnglishChars(@Name);

    -- update ONLY if the new filtered name does not already exist
    IF NOT EXISTS
    (
        SELECT 1
        FROM DR_Persons
        WHERE FilteredName = @NewFilteredName
          AND Id <> @PersonId
    )
    BEGIN
        UPDATE DR_Persons
        SET FilteredName = @NewFilteredName
        WHERE Id = @PersonId;
    END

    FETCH NEXT FROM curPersons INTO @PersonId, @Name;
END

CLOSE curPersons;
DEALLOCATE curPersons;


