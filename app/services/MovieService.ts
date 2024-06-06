import axios from "axios";
import { Movie } from "@/db/models/Movie/model/Movie";
import { Controller } from "@/libraries/Controller";
import { Request, Response } from "express";

const API_URL = process.env.THE_MOVIE_DB_URL;
const ACCESS_TOKEN = process.env.THE_MOVIE_DB_TOKEN;
const API_KEY = process.env.API_KEY;

export const fetchSingleMovieData = async (movieId: number) => {
  try {
    console.log("Fetching single movie data for ID:", movieId);
    const finalUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=es-MX&api_key=${API_KEY}`;
    console.log("Final URL:", finalUrl);
    const response = await axios.get(finalUrl, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    console.log("Fetched single movie data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching single movie data from API:", error);
    throw new Error("Error fetching single movie data from API");
  }
};

export const searchMoviesFromApi = async (query: string) => {
  try {
    const response = await axios.get(API_URL, {
      params: { query, language: "es-MX", api_key: API_KEY },
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error searching movies from API:", error);
    throw new Error("Error searching movies from API");
  }
};

export const getMovieListFromApi = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    const response = await searchMoviesFromApi(String(name));
    return Controller.ok(res, response);
  } catch (error) {
    console.error(error);
    return Controller.serverError(res, error.message);
  }
};

export const mapMovieToDatabase = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.query;
    const movieIdNumber = Number(movieId);

    if (isNaN(movieIdNumber)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const response = await fetchSingleMovieData(movieIdNumber);

    const alreadyExist = await Movie.findOne({
      where: { external_id: response.id },
    });

    if (alreadyExist) {
      return res.status(409).json({
        message: "Esta película ya está registrada en tu sistema",
        data: { id: alreadyExist.id },
      });
    }

    function mapToMovie(movieData: any) {
      return {
        name: movieData.title,
        fecha_lanzamiento: movieData.release_date,
        duration: movieData.runtime,
        poster_path: movieData.poster_path,
        description: movieData.overview,
        genero: movieData.genres.map((genre: any) => genre.name),
        rating: Math.round(movieData.vote_average),
        external_id: movieData.id,
      };
    }

    const mappedData = mapToMovie(response);
    const movieCreatedInDB = await Movie.create(mappedData);

    return Controller.created(res, movieCreatedInDB);
  } catch (error) {
    console.error(error);
    return Controller.serverError(res, error.message);
  }
};
