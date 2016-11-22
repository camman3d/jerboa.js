# Jerboa.js

[![Build Status](https://travis-ci.org/camman3d/jerboa.js.svg?branch=master)](https://travis-ci.org/camman3d/jerboa.js)
[![Code Climate](https://codeclimate.com/github/camman3d/jerboa.js/badges/gpa.svg)](https://codeclimate.com/github/camman3d/jerboa.js)
[![Test Coverage](https://codeclimate.com/github/camman3d/jerboa.js/badges/coverage.svg)](https://codeclimate.com/github/camman3d/jerboa.js/coverage)

<img alt="jerboa.js" src="https://github.com/camman3d/jerboa.js/raw/master/img/jerboa.jpg" height="400" />

Annotate and provide feedback on any web page. [View it in action](https://camman3d.github.io/jerboa.js/). Jerboa.js is
small (`jerboa.min.js` is ~6kb and `jerboa.min.css` is ~2kb) and has absolutely no dependencies so it's easy to use
anywhere!

## Usage

Include it:

```html
<link rel="stylesheet" href="https://cdn.rawgit.com/camman3d/jerboa.js/master/dist/jerboa.min.css" />
<script src="https://cdn.rawgit.com/camman3d/jerboa.js/master/dist/jerboa.min.js"></script>
```

Initialize it:

```js
jerboa.init();
```

Use it!

## Configuration

```js
jerboa.init({
    data: {},               // Custom data that is included in the annotation object,
    points: [],             // Pre-populates the page with this array of annotation objects
    currentUser: 'John Perkins',   // Display name of current user,
    currentUserId: '259837',    // User's Id
    isAdmin: 'false',  // true or false, dictates auth for changing status and owner of annotations
    positioning: 'percent', // Valid values are 'pixel' and 'percent'
    strategy: jerboa.strategies.global
});
```

The `positioning` configuration option determines how annotation locations are saved. The different values are:

| Value | Behavior |
| --- | --- |
| `percent` | Locations are saved as x/y percentages within the container. Works well when the container scales. |
| `pixel` | Locations are saved as x/y pixel offsets within the container. |

The `strategy` configuration option determines what elements is chosen to be the container. The value is a function with
the following signature:

```
(element) => boolean
```

When the user clicks on the page, jerboa navigates up the DOM tree from the clicked element checking each element with
the provided strategy. This function acts as filter; it returns true when the element qualifies as a container.  If no
element qualifies as the container then no annotation is created.

Jerboa.js comes with the following strategies:

| Value | Behavior |
| --- | --- |
| `jerboa.strategies.global` | Uses the `body` element as the container. |
| `jerboa.strategies.byClass('some-class-name')` | Uses the first ancestor with the `some-class-name` class. |

You can also provide your own strategy function:

```js
jerboa.init({
    strategy: function (element) {
        return element.dataset.isContainer;
    }
});
```

## Events

To handle saving, listen for the `save` event:

```js
jerboa.addEventListener('save', function (annotation) {
    console.log(annotation);
});
```

Listenable events are:

* `preAnnotate` - Fires when the user a spot to annotate
* `save` - Fires when the user clicks the *Save* button
* `cancel` - Fires when the user clicks the *Cancel* button
* `cancelReply` - Fires when the user cancels a reply comment
* `saveReply` - Fires when the user saves a reply comment


-----

Developed with ❤️ by the folks at [Experticity](https://www.experticity.com/)
