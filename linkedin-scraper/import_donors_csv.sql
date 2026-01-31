select c.name,c.url,b.url,a.*
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
c.name = p.Name
--or 
--c.url = b.url
)
where  (c.name is not null)
--and (c.name <> p.Name or pd.name <> p.Name) 
--and c.url = 'https://www.linkedin.com/in/angele-helies'
--and p.name like '%è%'
--and c.url <> b.url
order by name
---------------------------------------------------------------------------

select count(1)--3133
from(
select name
from _connected_people 
union all 
select name from _pending_requests
)x
