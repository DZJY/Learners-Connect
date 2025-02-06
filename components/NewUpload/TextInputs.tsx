import { useState, useEffect} from 'react';
import { createStyles, rem, TextInput } from '@mantine/core';

const useStyles = createStyles((theme) => ({
    root: {
      position: 'relative',
    },
  
    input: {
      height: rem(54),
      paddingTop: rem(18),
    },
  
    label: {
      position: 'absolute',
      pointerEvents: 'none',
      fontSize: theme.fontSizes.xs,
      paddingLeft: theme.spacing.sm,
      paddingTop: `calc(${theme.spacing.sm} / 2)`,
      zIndex: 1,
    },
  }));

  export function TextInputs({ fileName, title, setTitle, description, setDescription  }: { fileName: string, title: string, setTitle: any, description: string, setDescription: any }) {
    const { classes } = useStyles();
  

  
    useEffect(() => {
      if (fileName) {
        setTitle(fileName);
        setDescription(`Description for ${fileName} (optional)`);
      }
    }, [fileName]);
  
    return (
      <div>
        <TextInput 
          label="Title" 
          placeholder="Enter title of your lecture material" 
          classNames={classes} 
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
        />
  
        <TextInput 
          label="Description" 
          placeholder="Enter description of your lecture material (optional)" 
          classNames={classes} 
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
      </div>
    );
}