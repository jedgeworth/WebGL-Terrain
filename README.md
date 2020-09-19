
# Edge-GL

A WebGL port of my 3D terrain generator.

Before I entered the web industry, I was trying to write my own game engine in C++ OpenGL.

I've been itching to work with OpenGL again, and WebGL lets me do that using the same tools I use
in the web industry (with a lot less boilerplate code needed).

I am doing this open source in the hopes it helps someone get into OpenGL programming.

## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [Credits](#credits)

## Features

* 3D scene. All visuals rendered using shaders and vertex buffers (no immediate mode rendering).
* WASD camera controls to navigate the scene.
* 3D Terrain generator and renderer.

## Usage

Substitute `PROJECT-NAME` for your project name.

Clone the repository

```sh
 git clone https://github.com/jedgeworth/WebGL-Terrain.git PROJECT-NAME
 cd PROJECT-NAME
```

Install npm dependencies

```sh
 npm install 
```

Change your remote to upstream
```sh
git remote rename origin upstream
```

**Running, building**

To start the development server (served to http://localhost:8080 by default - you can change this in webpack.dev.js)

```sh
npm start
```

To build for production

```sh
npm run build
```

To preview the production build
```sh
npm run preview
```

## Credits

[Webpack-Starter-Basic](https://github.com/lifenautjoe/webpack-starter-basic), by [Joel Hernández](https://github.com/lifenautjoe)

[sylvester.js](https://github.com/jcoglan/sylvester), by [James Coglan](https://github.com/jcoglan)


___
Author [James Edgeworth](https://jamesedgeworth.com)

