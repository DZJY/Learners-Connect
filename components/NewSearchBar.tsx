import { TextInput, ActionIcon, useMantineTheme } from '@mantine/core';
import { IconSearch, IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import { useRef } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const theme = useMantineTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSearch = () => {
    const query = inputRef.current?.value || '';
    onSearch(query);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <TextInput
      icon={<IconSearch size="1.1rem" stroke={1.5} />}
      radius="xl"
      size="md"
      style={{width: '50%'}}
      rightSection={
        <ActionIcon size={32} radius="xl" color={theme.primaryColor} variant="filled">
          {theme.dir === 'ltr' ? (
            <IconArrowRight size="1.1rem" stroke={1.5} onClick={handleSearch} />
          ) : (
            <IconArrowLeft size="1.1rem" stroke={1.5} />
          )}
        </ActionIcon>
      }
      placeholder="Search file"
      rightSectionWidth={42}
      ref={inputRef}
      onKeyDown={handleKeyDown}
    />
  );
}
