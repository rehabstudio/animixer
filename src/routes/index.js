/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import UniversalRouter from 'universal-router/main.js';

const routes = [
  {
    path: '',
    components: () => [import(/* webpackChunkName: 'home' */ './Home')],
    render: ({ user, components: [Home] }) => ({
      title: 'Animixer',
      body: <Home user={user} />,
    }),
  },
  {
    path: '/about',
    components: () => [import(/* webpackChunkName: 'about' */ './About')],
    render: ({ user, components: [About] }) => ({
      title: 'About Us • Animixer',
      body: <About user={user} />,
    }),
  },
  {
    path: '/privacy',
    components: () => [import(/* webpackChunkName: 'privacy' */ './Privacy')],
    render: ({ user, components: [Privacy] }) => ({
      title: 'Privacy Policy • Animixer',
      body: <Privacy user={user} />,
    }),
  },
];

function resolveRoute(ctx) {
  const { route } = ctx;

  if (!route.render) {
    return ctx.next();
  }

  return Promise.all(route.components()).then(components =>
    ctx.render({
      user: ctx.user,
      location: ctx.location,
      route: route.render({
        user: ctx.user,
        location: ctx.location,
        components: components.map(x => x.default),
      }),
    }),
  );
}

export default new UniversalRouter(routes, { resolveRoute });
