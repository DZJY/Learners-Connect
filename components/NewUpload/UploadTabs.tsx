import { Tabs, TabsProps, rem, TabsValue, Center } from '@mantine/core';
import { IconFileText, IconVideo } from '@tabler/icons-react';
import { useState } from 'react';
import { DropzoneNotesButton, DropzoneVideoButton } from './DropzoneButton';
import { useSession } from 'next-auth/react';

function StyledTabs(props: TabsProps) {
  return (
    <Tabs
      unstyled
      styles={(theme) => ({
        tab: {
          ...theme.fn.focusStyles(),
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[9],
          border: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[4]
          }`,
          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
          cursor: 'pointer',
          fontSize: theme.fontSizes.sm,
          display: 'flex',
          alignItems: 'center',

          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },

          '&:not(:first-of-type)': {
            borderLeft: 0,
          },

          '&:first-of-type': {
            borderTopLeftRadius: theme.radius.md,
            borderBottomLeftRadius: theme.radius.md,
          },

          '&:last-of-type': {
            borderTopRightRadius: theme.radius.md,
            borderBottomRightRadius: theme.radius.md,
          },

          '&[data-active]': {
            backgroundColor: theme.colors.blue[7],
            borderColor: theme.colors.blue[7],
            color: theme.white,
          },
        },

        tabIcon: {
          marginRight: theme.spacing.xs,
          display: 'flex',
          alignItems: 'center',
        },

        tabsList: {
          display: 'flex',
          justifyContent: 'center'
        },
      })}
      {...props}
    />
  );
}

export default function UploadTabs({ setUploadedFile, setFileName }: { setUploadedFile: Function, setFileName: Function }) {
  const [active, setActive] = useState<TabsValue>('notes');
  const { data: session } = useSession();

  const handleTabChange = (value: TabsValue) => {
    if (value !== null) {
      setActive(value);
    }
  };
  return (
    <>
      {session ? (
        <div>
          <StyledTabs onTabChange={handleTabChange} defaultValue={'notes'}>
            <Tabs.List>
              <Tabs.Tab value="notes" icon={<IconFileText size="1rem" />}>
                Upload Notes
              </Tabs.Tab>
              <Tabs.Tab value="video" icon={<IconVideo size="1rem" />}>
                Upload Lecture Video
              </Tabs.Tab>
            </Tabs.List>
          </StyledTabs>

          {active === 'notes' && <DropzoneNotesButton setUploadedFile={setUploadedFile} setFileName={setFileName} />}

          {active === 'video' && <DropzoneVideoButton setUploadedFile={setUploadedFile} setFileName={setFileName}/>}
        </div>
      ) : (
        <Center maw={400} h={100} mx="auto">
          <strong>Sign in to upload</strong>
        </Center>
      )}
    </>
  );
}
