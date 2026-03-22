declare module 'react-router-dom' {
  import { NavigateFunction } from 'react-router-dom';
  
  export function useNavigate(): NavigateFunction;
  export function useLocation(): Location;
  export function useParams(): Record<string, string>;
  export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void];
} 