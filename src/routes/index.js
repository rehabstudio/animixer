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
      body: <Home user={user} />
    })
  },
  {
    path: '/animal',
    components: () => [import(/* webpackChunkName: 'animal' */ './Animal')],
    render: ({ user, location, components: [Animal] }) => ({
      title: 'Animal • Animixer',
      body: <Animal user={user} location={location} />
    })
  },
  {
    path: '/mixipedia',
    components: () => [import(/* webpackChunkName: 'about' */ './Mixipedia')],
    render: ({ user, components: [Mixipedia] }) => ({
      title: 'Mixipedia • Animixer',
      body: <Mixipedia user={user} />
    })
  },
  {
    path: '(.*)',
    components: () => [import(/* webpackChunkName: 'error' */ './ErrorPage')],
    render: ({ user, components: [ErrorPage] }) => ({
      title: 'Not Found • Animixer',
      body: <ErrorPage user={user} error={{ status: 404 }} />
    })
  }
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
        components: components.map(x => x.default)
      })
    })
  );
}

export default new UniversalRouter(routes, { resolveRoute });
