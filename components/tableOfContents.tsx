import { createStyles, Box, Text, Group, rem } from '@mantine/core';
import { IconListSearch } from '@tabler/icons-react';
import { useState } from 'react';

const useStyles = createStyles((theme) => ({
  link: {
    ...theme.fn.focusStyles(),
    display: 'block',
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    lineHeight: 1.2,
    fontSize: theme.fontSizes.sm,
    padding: theme.spacing.xs,
    borderTopRightRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
    borderLeft: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  linkActive: {
    fontWeight: 500,
    borderLeftColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 6 : 7],
    color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 2 : 7],

    '&, &:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
          : theme.colors[theme.primaryColor][0],
    },
  },
}));

interface TableOfContentsProps {
  id: string;
  links: { label: string; id: string; order: number }[];
}

function handleLinkClick(id: string) {
  const element = document.getElementById(id)!;

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
  });
}

export default function TableOfContents({ id, links }: TableOfContentsProps) {
  const [active, setActive] = useState(links[0].id);
  const { classes, cx } = useStyles();
  const items = links.map((item) => (
    <Box<'a'>
      component="a"
      onClick={(e) => {
        handleLinkClick(item.id);
        setActive(item.id);
      }}
      key={item.label}
      className={cx(classes.link, { [classes.linkActive]: active === item.id })}
      sx={(theme) => ({ paddingLeft: `calc(${item.order + 1} * ${theme.spacing.md})` })}
    >
      {item.label}
    </Box>
  ));

  return (
    <div>
      <Group my="md">
        <IconListSearch size="1.1rem" stroke={1.5} />
        <Text>Table of contents</Text>
      </Group>
      {items}
    </div>
  );
}
