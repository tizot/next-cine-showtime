import { formatInTimeZone } from "date-fns-tz";
import { parseISO } from "date-fns";
import { size } from "lodash";

type Movie = {
  title: string;
  duration: string;
  allocineId: string;
  sensCritiqueRating?: number;
  sensCritiqueUrl?: string;
  userRating?: number;
  pressRating?: number;
  showtimes: Record<string, string[]>;
};

const Showtimes = ({
  movies,
  isLoading,
}: {
  movies: Movie[];
  isLoading: boolean;
}) => {
  return (
    <div className="showtimes-table overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="py-1 inline-block min-w-full sm:px-2 lg:px-4">
        <div className="overflow-hidden">
          <table className="min-w-full text-center">
            <thead className="border-b bg-white">
              <tr className="border bg-gray-300">
                <th scope="col" className="header-cell">
                  Titre
                </th>
                <th scope="col" className="header-cell">
                  Durée
                </th>
                <th scope="col" className="header-cell">
                  SensCritique
                </th>
                <th scope="col" className="header-cell">
                  Spectateurs
                </th>
                <th scope="col" className="header-cell">
                  Presse
                </th>
                <th scope="col" className="header-cell">
                  Cinéma
                </th>
                <th scope="col" className="header-cell">
                  Horaires
                </th>
              </tr>
            </thead>
            <tbody className="border-b">
              {isLoading ? (
                <tr>
                  <td colSpan={7}>Chargement...</td>
                </tr>
              ) : movies.length === 0 ? (
                <tr>
                  <td colSpan={7}>Aucun film...</td>
                </tr>
              ) : (
                movies.map((movie, idx) => {
                  const cineCount = size(movie.showtimes);
                  return Object.entries(movie.showtimes).map(
                    ([cinema, times], innerRowIdx) => (
                      <tr
                        key={`${movie.title}--${innerRowIdx}`}
                        className={`border ${
                          idx % 2 == 0 ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        {innerRowIdx === 0 ? (
                          <>
                            <td rowSpan={cineCount} className="font-normal">
                              <a
                                href={`https://www.allocine.fr/film/fichefilm_gen_cfilm=${movie.allocineId}.html`}
                                target="_blank"
                              >
                                {movie.title}
                              </a>
                            </td>
                            <td rowSpan={cineCount}>{movie.duration}</td>
                            <td rowSpan={cineCount}>
                              {movie.sensCritiqueRating ? (
                                <a
                                  href={`https://www.senscritique.com${movie.sensCritiqueUrl}`}
                                  target="_blank"
                                >
                                  {movie.sensCritiqueRating}
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td rowSpan={cineCount}>
                              {movie.userRating ? (
                                <a
                                  href={`https://www.allocine.fr/film/fichefilm_gen_cfilm=${movie.allocineId}.html`}
                                  target="_blank"
                                >
                                  {movie.userRating}
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td rowSpan={cineCount}>
                              {movie.pressRating ? (
                                <a
                                  href={`https://www.allocine.fr/film/fichefilm-${movie.allocineId}/critiques/presse/`}
                                  target="_blank"
                                >
                                  {movie.pressRating}
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                          </>
                        ) : null}
                        <td>{cinema}</td>
                        <td className="text-left">
                          {times
                            .map((t) =>
                              formatInTimeZone(
                                parseISO(t),
                                "Europe/Paris",
                                "HH:mm"
                              )
                            )
                            .join(" - ")}
                        </td>
                      </tr>
                    )
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Showtimes;
