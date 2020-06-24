drop table if exists bookmarks;

create table bookmarks (
    id INTEGER primary key NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    description text,
    rating INTEGER DEFAULT 1 NOT NULL
);

insert into bookmarks (id, title, url)
values
(1, 'facebook', 'www.facebook.com'),
(2, 'google', 'www.google.com'),
(3, 'instagram', 'www.instagram.com'),
(4, 'tumblr', 'www.tumblr.com'),
(5, 'youtube', 'www.youtube.com'),
(6, 'ecosia', 'www.ecosia.org'),
(7, 'bloc', 'bloc.io'),
(8, 'yahoo', 'www.yahoo.com'),
(9, 'bing', 'www.bing.com'),
(10, 'myspace', 'www.myspace.com');