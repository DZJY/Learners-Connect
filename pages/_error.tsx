import { NotFoundTitle } from '../components/ErrorPage/NotFoundTitle'; // adjust the path as necessary
import { useRouter } from 'next/router';
import { NextPageContext } from 'next';

interface CustomErrorProps {
  statusCode: number;
}

export default function CustomError({ statusCode }: CustomErrorProps) {
  const router = useRouter();

  const goToHomePage = () => {
    try {
      router.push('/'); // assuming '/' is your home page
    } catch (error) {
      console.error('Error while navigating:', error);
    }
  };

  if (statusCode === 404) {
    return <NotFoundTitle />;
  } else {
    return (
      <div>
        <h1>There was an error</h1>
        <p>Please try again later.</p>
        <button onClick={goToHomePage}>Go Home</button>
      </div>
    );
  }
}

CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
