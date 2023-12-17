--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0
-- Dumped by pg_dump version 16.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: get_trip_info(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_trip_info(trip_id_param text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    trip_info jsonb;
BEGIN
    WITH tripStopsCTE AS (
        SELECT
            trip_id,
            stop_id,
            stop_sequence,
            stop_name,
            stop_lat,
            stop_lon,
            arrival_time,
            departure_time,
            stop_headsign
        FROM stop_times
        JOIN stops USING (stop_id)
        WHERE trip_id = trip_id_param
        ORDER BY stop_sequence ASC
    )

    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'stop_id', stop_id,
                'stop_sequence', stop_sequence,
                'stop_name', stop_name,
                'stop_headsign', stop_headsign,
                'stop_lat', stop_lat,
                'stop_lon', stop_lon,
                'arrival_time', arrival_time,
                'departure_time', departure_time,
                'time_till_next_stop', time_till_next_stop::interval
            )
        ) INTO trip_info
    FROM (
        SELECT
            *,
            COALESCE(
                LEAD(arrival_time) OVER (ORDER BY stop_sequence) - arrival_time,
                INTERVAL '0 seconds'
            ) AS time_till_next_stop
        FROM tripStopsCTE
    ) AS temp_trip_info;

    RETURN trip_info;
END;
$$;


ALTER FUNCTION public.get_trip_info(trip_id_param text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.routes (
    route_id integer NOT NULL,
    agency_id integer,
    route_short_name character varying(50),
    route_long_name character varying(255),
    route_desc text,
    route_type integer,
    route_url character varying(255),
    route_color character varying(10),
    route_text_color character varying(10)
);


ALTER TABLE public.routes OWNER TO postgres;

--
-- Name: stop_times; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stop_times (
    trip_id character varying(255) NOT NULL,
    arrival_time interval,
    departure_time interval,
    stop_id character varying(255),
    stop_sequence integer NOT NULL,
    stop_headsign character varying(255),
    pickup_type integer,
    drop_off_type integer,
    shape_dist_traveled double precision
);


ALTER TABLE public.stop_times OWNER TO postgres;

--
-- Name: stops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stops (
    stop_id character varying(50) NOT NULL,
    stop_code character varying(50),
    stop_name character varying(255),
    stop_desc text,
    stop_lat double precision,
    stop_lon double precision,
    zone_id character varying(50),
    stop_url character varying(255),
    location_type integer,
    parent_station integer
);


ALTER TABLE public.stops OWNER TO postgres;

--
-- Name: stopsjson; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.stopsjson AS
 SELECT jsonb_object_agg((stop_id)::text, jsonb_build_object('stop_name', stop_name, 'stop_lat', stop_lat, 'stop_lon', stop_lon)) AS stops
   FROM public.stops;


ALTER VIEW public.stopsjson OWNER TO postgres;

--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    route_id integer,
    service_id character varying(255),
    trip_id character varying(255) NOT NULL,
    trip_headsign character varying(255),
    trip_short_name character varying(255),
    direction_id integer,
    block_id integer,
    shape_id integer
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- Name: tripstops; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.tripstops AS
 SELECT stop_times.trip_id,
    stops.stop_id,
    stop_times.stop_sequence,
    stops.stop_name,
    stops.stop_lat,
    stops.stop_lon,
    stop_times.arrival_time,
    stop_times.departure_time,
    stop_times.stop_headsign
   FROM (public.stop_times
     JOIN public.stops USING (stop_id))
  ORDER BY stop_times.stop_sequence;


ALTER VIEW public.tripstops OWNER TO postgres;

--
-- Name: triptime; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.triptime AS
 SELECT trip_id,
    stop_sequence,
    COALESCE((lead(arrival_time) OVER () - arrival_time), '00:00:00'::interval) AS time_till_next_stop
   FROM public.tripstops
  ORDER BY stop_sequence;


ALTER VIEW public.triptime OWNER TO postgres;

--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (route_id);


--
-- Name: stops stops_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stops
    ADD CONSTRAINT stops_pkey PRIMARY KEY (stop_id);


--
-- Name: stop_times trip_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stop_times
    ADD CONSTRAINT trip_schedule_pkey PRIMARY KEY (trip_id, stop_sequence);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (trip_id);


--
-- Name: stop_times trip_schedule_stop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stop_times
    ADD CONSTRAINT trip_schedule_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.stops(stop_id);


--
-- Name: stop_times trip_schedule_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stop_times
    ADD CONSTRAINT trip_schedule_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(trip_id);


--
-- Name: trips trips_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(route_id);


--
-- PostgreSQL database dump complete
--

