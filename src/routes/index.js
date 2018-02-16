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
    render: ({ location, components: [Home] }) => ({
      title: 'Animixer',
      body: <Home />
    })
  },
  {
    path: '/animal',
    components: () => [import(/* webpackChunkName: 'animal' */ './Animal')],
    render: ({ location, components: [Animal] }) => ({
      title: 'Animal • Animixer',
      body: <Animal location={location} />
    })
  },
  {
    path: '/mixipedia',
    components: () => [import(/* webpackChunkName: 'about' */ './Mixipedia')],
    render: ({ location, components: [Mixipedia] }) => ({
      title: 'Mixipedia • Animixer',
      body: <Mixipedia />
    })
  },
  {
    path: '(.*)',
    components: () => [import(/* webpackChunkName: 'error' */ './ErrorPage')],
    render: ({ location, components: [ErrorPage] }) => ({
      title: 'Not Found • Animixer',
      body: <ErrorPage error={{ status: 404 }} />
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
      location: ctx.location,
      callbacks: ctx.callbacks,
      route: route.render({
        location: ctx.location,
        components: components.map(x => x.default)
      })
    })
  );
}

export default new UniversalRouter(routes, { resolveRoute });
