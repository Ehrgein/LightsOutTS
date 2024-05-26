import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const useGetOutageData = (provider: string) => {
  const newURL = provider ? `api/outages?provider=${provider}` : null;

  const { data, error, isLoading } = useSWR(newURL, fetcher);

  return {
    data,
    error,
    isLoading: !error && !data,
  };
};

export default useGetOutageData;
