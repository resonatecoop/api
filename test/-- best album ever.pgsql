-- best album ever

-- get track group info for best album ever
--    returns track group id= '84322e4f-0247-427f-8bed-e7617c3df5ad';
select *
from track_groups
where title =  'Best album ever';

-- get track group items
-- select id, track_id
select *
from track_group_items
where track_group_id = '84322e4f-0247-427f-8bed-e7617c3df5ad';
-- -- -- where track_group_id = '8e9c188c-0f1f-4c99-ac89-0709970345bd'
-- -- where track_group_id = '58991f22-b172-48e4-8b27-e0a4c946f9b2'
-- order by index;

-- get tracks by a track group
--    track_group_items.track_id = tracks.id
select *
from tracks t
where t.id in (
select tgi.track_id
from track_group_items tgi 
where tgi.track_group_id = '84322e4f-0247-427f-8bed-e7617c3df5ad'
order by index
);

--  get a track
--    Ergonomic interactive concept / Laurie Yost
select *
from tracks
where id = '44a28752-1101-4e0d-8c40-2c36dc82d035';
-- where id = '706cff12-ba44-49f7-8982-98b3996a2919';

-- get files for tracks
--  tracks.track_url looks like it keys to file.id, but not certain about this.
-- delete from files;

select *
from files;
