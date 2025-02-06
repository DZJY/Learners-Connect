import { createStyles, Button, Menu, Group, ActionIcon, rem } from '@mantine/core';
import { IconLanguage, IconChevronDown } from '@tabler/icons-react';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import { saveAs } from 'file-saver';

const useStyles = createStyles((theme) => ({
  button: {},

  menuControl: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    border: 0,
    borderLeft: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white
    }`,
  },
}));

export function DownloadOriginalButton({ fileId }: { fileId: ObjectId }) {
  const { classes, theme } = useStyles();
  const downloadOriginalHandler = () => {
    window.open(`/api/files/${fileId}`);
  };
  return (
    <Group noWrap spacing={0}>
      <Button onClick={downloadOriginalHandler} className={classes.button}>
        Download Original Document
      </Button>
    </Group>
  );
}

export function DownloadSummaryButton({ summary }: { summary: string }) {
  const { classes, theme } = useStyles();
  const menuIconColor = theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 5 : 6];
  const supportedLanguages = [
    { name: 'English', code: 'en' },
    { name: 'Mandarin', code: 'zh' },
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Italian', code: 'it' },
    { name: 'Portuguese', code: 'pt' },
    { name: 'Russian', code: 'ru' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Korean', code: 'ko' },
    { name: 'Arabic', code: 'ar' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Dutch', code: 'nl' },
    { name: 'Greek', code: 'el' },
    { name: 'Hebrew', code: 'he' },
  ];
  
  const downloadSummaryHandler = async (languageCode: string) => {
    const response = await axios.post('/api/translate', {
      text: summary,
      targetLanguage: languageCode,
    });
    
    const translatedSummary = response.data.translation;
    
    axios.post('/api/downloadSummary', { summary: translatedSummary }, { responseType: 'blob' }).then((response) => {
      saveAs(new Blob([response.data]), 'Summary.docx');
    });
  };

  return (
    <Group noWrap spacing={0}>
      <Button
        onClick={() => downloadSummaryHandler('en')}
        className={classes.button}
        color="teal.6"
      >
        Download Summary
      </Button>
      <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
        <Menu.Target>
          <ActionIcon
            variant="filled"
            color={`teal.${theme.colorScheme === 'dark' ? 5 : 6}`} // Set the icon color dynamically
            size={36}
            className={classes.menuControl}
          >
            <IconChevronDown size="1rem" stroke={1.5} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown style={{ maxHeight: '300px', overflow: 'auto' }}>
          {supportedLanguages.map((language) => (
            <Menu.Item
              key={language.name}
              onClick={() => downloadSummaryHandler(language.code)}
              icon={<IconLanguage size="1rem" stroke={1.5} color={menuIconColor} />}
            >
              Download in {language.name}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
