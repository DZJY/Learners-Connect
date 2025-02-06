import { useState } from 'react';
import { useInterval } from '@mantine/hooks';
import { createStyles, Button, Progress } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  button: {
    position: 'relative',
    transition: 'background-color 150ms ease',
  },

  progress: {
    ...theme.fn.cover(-1),
    height: 'auto',
    backgroundColor: 'transparent',
    zIndex: 0,
  },

  label: {
    position: 'relative',
    zIndex: 1,
  },
}));

export function SubmitButton({ onUpload }: { onUpload: () => void }) {
  const { classes, theme } = useStyles();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 30) {
          return current + 1;
        }
        if (current < 95) {
          return current + 0.1;
        }
        interval.stop();
        return current;
      }),
    20
  );
  const handleClick = async () => {
    setLoaded(false);
    !interval.active && interval.start();
    await onUpload();
    setProgress(100);
    interval.stop();
    setLoaded(true);
  };
  return (
    <Button
      fullWidth
      className={classes.button}
      onClick={handleClick}
      color={loaded ? 'teal' : theme.primaryColor}
    >
      <div className={classes.label}>
        {progress === 0
          ? 'Upload files'
          : progress !== 100
          ? 'Uploading files'
          : loaded
          ? 'Files uploaded'
          : 'Upload files'}
      </div>
      {progress !== 0 && (
        <Progress
          value={progress}
          className={classes.progress}
          color={theme.fn.rgba(theme.colors[theme.primaryColor][2], 0.35)}
          radius="sm"
        />
      )}
    </Button>
  );
}
