# Jerboa.js

<img alt="jerboa.js" src="https://github.com/camman3d/jerboa.js/raw/master/img/jerboa.jpg" height="400" />

Annotate and provide feedback on any web page. [View it in action.](https://camman3d.github.io/jerboa.js/)

## Usage

Include it:

```html
<link rel="stylesheet" href="https://cdn.rawgit.com/camman3d/jerboa.js/master/src/jerboa.css" />
<script src="https://cdn.rawgit.com/camman3d/jerboa.js/master/src/jerboa.js"></script>
```

Initialize it:

```js
jerboa.init();
```

Use it!

## Configuration

```js
jerboa.init({
    data: {}, // Custom data that is included in the annotation object,
    points: [] // Pre-populates the page with this array of annotation objects 
});
```

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


-----

Developed with ❤️ by the folks at [Experticity](https://www.experticity.com/)
