select c.name,
lower(dbo.ReplaceNonEnglishChars(c.name)) c_filterName, lower(p.FilteredName) as p_FilteredName,
p.Name as p_Name
,c.url,b.url,a.*
--delete a
--update a set a.IsConnected = c.is_connected
from [DR_UserSocialMediaAccounts] a--3018
join [DR_SocialMediaAccounts] b
on a.SocialMediaAccountId = b.Id
and b.SocialMediaPlatform = 1
join [DR_Persons] p on p.Id = b.PersonId
--and a.[UserId] != '0046388E-9CC3-8257-50F9-3A1BFD810B78'
--join [DR_PostSocialMediaAccounts] s on s.SocialMediaAccountId = a.SocialMediaAccountId
left join (
select *, 1 as is_connected
from _connected_people 
union all 
select *, 0 as is_connected from _pending_requests
--order by name
) c on (
lower(dbo.ReplaceNonEnglishChars(c.name)) = lower(p.FilteredName)
--or 
--c.url = b.url
)
where  not (c.name is not null)
--and (c.name <> p.Name or pd.name <> p.Name) 
--and c.url = 'https://www.linkedin.com/in/angele-helies'
--and p.name like '%è%'
--and c.url <> b.url
order by name
-----------------------

---------------------------------------------------------------------------

select count(1)--3133
from(
select *, 1 as is_connected
from _connected_people 
union all 
select *, 0 as is_connected from _pending_requests
)x
-----------------------------------------
SELECT REPLACE(
(
    SELECT
        p.Id AS donorId,
        x.Name,
        (
            SELECT
                b.Id AS socialMediaAccountId,
                'LinkedIn' AS platform,
                x.Url
            FOR JSON PATH
        ) AS platforms
    FROM
    (
        SELECT *, 1 AS is_connected FROM _connected_people
        UNION ALL
        SELECT *, 0 AS is_connected FROM _pending_requests
    ) x
    LEFT JOIN
    (
        SELECT p.FilteredName,p.Name
        FROM [DR_UserSocialMediaAccounts] a
        JOIN [DR_SocialMediaAccounts] b
            ON a.SocialMediaAccountId = b.Id
           AND b.SocialMediaPlatform = 1
        JOIN [DR_Persons] p
            ON p.Id = b.PersonId
    ) y 
	ON lower(dbo.ReplaceNonEnglishChars(x.name)) = lower(y.FilteredName)
	--ON x.name = y.Name
    LEFT JOIN [DR_Persons] p
        ON lower(p.FilteredName) = lower(dbo.ReplaceNonEnglishChars(x.Name))
		--ON p.name = x.Name
    LEFT JOIN [DR_SocialMediaAccounts] b
        ON b.PersonId = p.Id
       AND b.SocialMediaPlatform = 1
    WHERE y.FilteredName IS NULL
      AND x.is_connected = 0
    FOR JSON PATH
),
'\/', '/'
) AS JsonResult;





select * from DR_Persons
where FilteredName ='Amra Marusic'
-------------------------------
select *,dbo.ReplaceNonEnglishChars(c.name) as FilteredName from
 (
select *, 1 as is_connected
from _connected_people 
union all 
select *, 0 as is_connected from _pending_requests
--order by name
) c
where lower(dbo.ReplaceNonEnglishChars(c.name)) like '%manda%'
-----------------------------------------------
select * from DR_Persons
where
name ='Álvaro Magalló Paz'
--FilteredName = 'alvaro Magallo Paz'


select count(1) from DR_Persons p
where FilteredName <> dbo.ReplaceNonEnglishChars([Name])

--39044

select Id,[Name],
dbo.ReplaceNonEnglishChars([Name]) as NewFilterName
--into _DupPresons
from DR_Persons
WHERE FilteredName LIKE N'%[áàäâãåāçčćéèëêēíìïîīñńóòöôõøōúùüûūýÿšśžźżæœß]%'

236655

select * from DR_Persons
where
dbo.ReplaceNonEnglishChars([Name]) = 'eimear Murphy'
--39044

--update
--DR_Donations
--set PersonId = 39044
--where PersonId = 236655

--update
--DR_SocialMediaAccounts
--set PersonId = 39044
--where PersonId = 236655 

--update
--DR_SocialMediaAccountCheckDates
--set PersonId = 39044
--where PersonId = 236655 

