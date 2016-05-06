CREATE database focus with OWNER= foo


CREATE TABLE TinyFocus(
	id SERIAL PRIMARY KEY,
	FocusIndex INTEGER,
	Username VARCHAR(20),
	DateTime TIMESTAMP,
	FocusLevel NUMERIC(20,10)
);

CREATE TABLE users(
	ID SERIAL PRIMARY KEY,
	username VARCHAR(20) UNIQUE,
	professionalrole VARCHAR(20),
	AutomaticTimeZone BOOLEAN,
	FocusRanking VARCHAR(20),
	offset_val VARCHAR(100)
);	  


CREATE TABLE activity(
	id SERIAL PRIMARY KEY,
	hour TIMESTAMP,
	host VARCHAR(500),
	category varchar(100),
	tool varchar(100),
	mintimeticks TIMESTAMP,
	maxtimeticks TIMESTAMP,
	navigation VARCHAR(100),
	debugging VARCHAR(100),
	debugger VARCHAR(100),
	navigationcount INTEGER,
	debuggingcount INTEGER,
	debuggercount INTEGER,
	username VARCHAR(20)
);