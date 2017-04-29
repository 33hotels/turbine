<img align="right" src="https://avatars0.githubusercontent.com/u/21360882?v=3&s=200">

# Funnel

A purely functional frontend framework based on functional reactive
programming. Experimental.

[![Build Status](https://travis-ci.org/funkia/funnel.svg?branch=master)](https://travis-ci.org/funkia/funnel)
[![codecov](https://codecov.io/gh/funkia/funnel/branch/master/graph/badge.svg)](https://codecov.io/gh/funkia/funnel)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/funnel.svg)](https://saucelabs.com/u/funnel)

# Table of contents

* [High level overview](#high-level-overview)
* [Installation](#installation)
* [Example](#example)
* [Examples](#examples)
* [Tutorial](#tutorial)
* [Contributing](#contributing)

## Why Funnel?

The JavaScript world is full of frameworks. So why another one?
Because we want something _different_. We want something that is
purely functional without compromises. Something that takes the best
lessons from existing JavaScript frameworks and couples them with the
powerful techniques found in functional languages like Haskell. We
want a framework that is highly expressive. Because when functional
programming is at it's best it gives you more power, not less. Funnel
is supposed to be approachable for typical JavaScript developers while
still preserving the benefits that comes from embracing purely
functional programming.

We have done our best to realize our goal. But we are not done yet. We
hope you will find Funnel interesting, try it and maybe even help us
making it even better.

## High level overview

Here our some of our key features.

* Purely functional. A Funnel app contains exactly one impure function
  invocation.
* Leverage TypeScript and runtime checking to improve the developing
  experience.
* Based on classic FRP. Behaviors represents values that change over
  time and streams provide reactivity. Funnel uses the FRP
  library [Hareactive](https://github.com/Funkia/hareactive).
* A component-based architecture. Components are encapsulated and
  composable. Components are monads and are typically used and
  composed with do-notation (we implement do-notation with
  generators).
* Constructed DOM elements reacts directly to behaviors and streams.
  This avoids the overhead of using virtual DOM and should lead to
  great performance.
* Side-effects are expressed with a declarative IO monad. This allows
  for easy testing of code with side-effects. Furthermore, the
  IO-monad is integrated with FRP.
* The entire dataflow through applications is explicit and easy to
  follow.
* Our libraries are available both as CommonJS and ES2015 modules.
  This allows for tree-shaking.

Here are some of the features we want to implement and goals we're
working towards.

* Declarative and concise testing of time-dependent FRP code.
* Performance. We think Funnel can be made very efficient. But we are
  not yet at a point where we focus on performance.
* Support for server side rendering.
* Browser devtools for easier development and debugging.
* Hot-module replacement (if possible given our design).

## Installation

```sh
npm install @funkia/funnel @funkia/hareactive @funkia/jabz
```

[Hareactive](https://github.com/Funkia/hareactive) and
[Jabz](https://github.com/Funkia/jabz) are peer dependencies that
Funnel uses. Hareactive is the FRP library that we use and Jabz
provides some very useful functional abstractions.

Alternatively, for trying out Funnel you may want to see our [Funnel starter kit](https://github.com/funkia/funnel-starter).

## Example

The example below creates an input field and print whether or not it
is valid.

```js
import {map} from "@funkia/jabz";
import {runMain, elements, loop} from "@funkia/funnel";
const {span, input, div} = elements;

const isValidEmail = (s: string) => s.match(/.+@.+\..+/i);

const main = go(function*() {
  yield span("Please enter an email address: ");
  const {inputValue: email} = yield input();
  const isValid = map(isValidEmail, email);
  yield div([
    "The address is ", map((b) => b ? "valid" : "invalid", isValid)
  ]);
});

// `runMain` should be the only impure function in application code
runMain("#mount", main);
```

See the [tutorial](#tutorial) below which explains how the above
example work.

## Examples

Here is a series of examples that demonstrate how to use Funnel.
Approximately listed in order of increasing complexity.

* [Simple](/examples/simple) — Very simple example of an
  email validator.
* [Fahrenheit celsius](/examples/fahrenheit-celsius) — A
  converter between fahrenheit and celsius.
* [Zip codes](/examples/zip-codes) — A zip code validator.
  Shows one way of doing HTTP-requests with the IO-monad.
* [Continuous time](/examples/continuous-time) —
  Shows how to utilize continuous time.
* [Counters](/examples/counters) — A list of counters.
  Demonstrates nested components, managing a list of components and
  how child components can communicate with parent components.
* [Todo](/examples/counters) — An implementation of the
  classic TodoMVC application. Note: Routing is not implemented yet.

## Tutorial

In this tutorial we will build a simple application with a list of
counters. The application will be simple but not completely trivial.
Along the way most of the key concepts in Funnel will be explained. We
will se how to create HTML, how to create custom components, how a
component can be nested and how it can share state with its parent.

Please open an issue if you have questions regarding the tutorial or
ideas for improvements.

The final result and the intermediate states can be seen by cloning
this git repository, going into the directory with the counters
example and running webpack to serve the application.

```
git clone https://github.com/funkia/funnel/
cd funnel/examples/counters
npm run start
```

### FRP

Funnel builds on top of the FRP library Hareactive. The two key
concepts from FRP are _behavior_ and _stream_. They are documented in
more detail in the [Hareactive
readme](https://github.com/Funkia/hareactive). But the most important
things to understand are behavior and stream.

* `Behavior` represents values that change over time. For instance,
  the position of the mouse or the number of times a user has clicked
  a button.
* `Stream` represents discrete events that happen over time. For
  instance click events.

### What is `Component`

On top of the FRP primitives Funnel adds `Component`. Component is the
key concept in Funnel. Once you understand `Component`—and how to use
it—you understand Funnel. A Funnel app is just one big component.

 Here is a high-level overview of what a component is.

* Components can __contain logic__ expressed through operations on
  behaviors and streams.
* Components are __encapsulated__ and have completely private state.
* Components __produce output__ through which they selectively decide
  what state they share with their parent.
* Components __write DOM elements__ as children to their parent. They
  can write zero, one or more DOM elements.
* Components can __declare side-effects__ expressed as `IO`-actions.
* Components are __composable__—one component can be combined with
  another component and the result is a third component.

### Creating HTML-elements

Funnel includes functions for creating components that represent
standard HTML-elements. When you create your own components they will
be made of these.

The element functions accept two arguments, both of which are
optional. The first is an object describing various things like
attributes, classes, etc. The second argument is a child component.
For instance, to create a div with a span child we would write.

```typescript
const myDiv = div({class: "foo"}, span("Some text"));
```

The element functions are overloaded. So instead of giving `span` a
component as child we can give it a string. The element functions also
accepts an array of child elements like this.

```typescript
const myDiv = div({class: "foo"}, [
  h1("A header"),
  p("Some text")
])
```

Using this we can build arbitrarily complex HTML. As an example we
will build a simple view for a counter in our counter-application.

```ts
import { elements } from "../../../src";
const { br, div, button } = elements;

// Counter
const counterView = div([
  "Counter ",
  1,
  " ",
  button("+"),
  " ",
  button("-")
]);

runComponent("body", counterView);
```

We define `counterView` as div-element with some text and two buttons
inside. Since `div` returns a component `counterView` is a component.
And a Funnel application is just a component so we have a complete
application. We run the application on the last line when we call
`runComponent`. It is an impure function that takes a selector, a
component and runs the component with the found element as parent. You
can view the entire code in `version1.ts`.

### Dynamic HTML

The `counterView` above is completely static. The buttons do nothing
and we hard-coded the value `1` into the view. Our next task is to
make the program interactive.

Anywhere where we can give the element functions a constant value of a
certain type we can alternatively give them a behavior with a value of
that type. For instance, if we have a string-valued behavior we can
use it like this

```ts
const mySpan = span(stringBehavior);
```

This will construct a component representing a span element with text
content that is kept up to date with the value of the behavior.

To make the count in our counter view dynamic we turn it into a
function that takes a behavior of a number and inserts it into the
view.

```js
const counterView = ({ count }: CounterViewInput) => div([
  "Counter ",
  count,
  " ",
  button("+"),
  " ",
  button("-"),
]);
```

Because it will be easier going forward `counterView` takes an object
with a `count` property.

### Output from HTML components

The above covers the _input_ to the counter view. We now need to get
_output_ from it. All components in Funnel can produce output.
Components are represented by a generic type `Component<A>`. The `A`
represents the output of the component.

As an example, a component that represents an input element has output
that contains a behavior of the current string value in the input box.

```ts
const usernameInput = input({attrs: {placeholder: "Username"}});
```

Here `usernameInput` has the type `Component<Output>` where `Output`
is an object containing the output that an `input` element produces.
Among other things, an `input` element produces a string-valued
behavior named `inputValue` that contains the current content of the
`input` element. So, the type of `usernameInput` above is something
like `Component<{inputValue: Behavior<string>, ...}>`. The dots are
there to indicate the the component has other output as well.

We want our counter view to produce two streams as output. One stream
should be from whenever the first button is clicked the the other
stream clicks from the second button. That is, the view's output
should the type `{increment: Behavior<number>, decrement:
Behavior<number>}` The simplest way to get achieve that looks like
this:

```js
const counterView = ({ count }: CounterViewInput) => div([
  "Counter ",
  count,
  " ",
  button({ output: { incrementClick: "click" } }, "+"),
  " ",
  button({ output: { decrementClick: "click" } }, "-"),
]);
```

The `output` object given to the `button` functions tells them what
output to produce. They will each output an object, the first with a
stream named `incrementClick` and the later with one named
`decrementClick`. The `div` function will combine all the objects
output by the components in the array passed to it and output that.
The result is that `counterView` returns a component that produces two
streams as output.

### Adding a model

We now need to add a model with some logic to our counter view. The
model needs to handle the increment and decrement stream and turn them
into a behavior that represents the current count.

Funnel offers the function `modelView` for creating components with
logic. `modelView` takes two arguments. The first describes the logic
and the second the view. This keeps the logic neatly separated from
the view.

The second argument to `modelView`, the view, is a function that
returns a component. We already have such a function: `counterView`.

The first argument is a function that returns a `Now`-computation. You
don't have to fully understand `Now`. One of the things it does is to
make it possible to create stateful behaviors. The model function will
as input receive the output from the component that the view function
returns. The result of the `Now`-computation must be a pair. The first
value in the pair will be passed on to the view function and the
second value will be the output of the component that `modelView`
returns. Here is how we use to create our counter component.

```ts
function* counterModel(
  { incrementClick, decrementClick }: CounterModelInput
) {
  const increment = incrementClick.mapTo(1);
  const decrement = decrementClick.mapTo(-1);
  const changes = combine(increment, decrement);
  const count = yield sample(scan((n, m) => n + m, 0, changes));
  return [{ count }, { count }];
}

const counter = modelView(counterModel, counterView);
```

Note that there is a cyclic dependency between the model and the view.
The figure below illustrates this.

![Component figure](https://rawgit.com/funkia/funnel/master/figures/model-view.svg)

We now have a fully functional counter. You have now seen how to
create a simple component with encapsulated state and logic. The
current code can be seen in `version2.ts`.

### Creating a list of counters

Our next step is to create a list of counters. WIP.

## API Documentation

The API documentation is incomplete. See also the
[examples](#examples), the [tutorial](#tutorial), the [Hareactive
documentation](https://github.com/funkia/hareactive) and this tutorial
about the
[`IO`-monad](https://github.com/funkia/jabz/blob/master/docs/io-tutorial.md).

### Component

#### `Component#map`

Mapping over a component is a way of applying a function to the output
of a component. If a component has output of type `A` then we can map
a function from `A` to `B` over the component and get a new component
whose output is of type `B`.

In the example below `input` creates a component with an object as
output. The object contains a behavior named `inputValue`. The
function given to `map` receives the output from the component. 

We then call `map` on the behavior `inputValue` and take the length of
the string. The result is that `usernameInput` has the type
`Component<Behavior<number>>` because it's mapped output is a
number-valued behavior whose value is the current length of the text
in the input element.

```ts
const usernameInput =
  input({class: "form-control"})
    .map((output) => output.inputValue.map((s) => s.length));
```

#### `Component#chain`

`map` makes it possible to transform and change the output from a
component. However, it does not make it possible to take output from
one component and pipe it into another component. That is where
`chain` enters the picture. The type of the `chain` method is as
follows.

```typescript
chain((output: Output) => Component<NewOutput>): Component<NewOutput>;
```

The `chain` method on a components with output `Output` takes a
function that takes `Output` as argument and returns a new component.
Here is an example. An invocation `component.chain(fn)` returns a new
component that works like this:

* The output from `component` is passed to `fn`.
* `fn` returns a new component, let's call it `component2`
* The DOM-elements from `component` and `component2` are both added to
  the parent.
* The output is the output from `component2`.

Here is an example.

```typescript
input().chain((inputOutput) => span(inputOutput.inputValue));
```

The above example boils down to this:

```typescript
Create input component   Create span component with text content
  ↓                             ↓
input().chain((inputOutput) => span(inputOutput.inputValue));
                   ↑                                ↑
      Output from input-element       Behavior of text in input-element
```

The result is an input element followed by a span element. When
something is written in the input the text in the span element is
updated accordingly.

With `chain` we can combine as many elements as we'd like. The code
below combines two `input` elements with a `span` that show the
concatenation of the text in the two input fields.

```typescript
input({ attrs: { placeholder: "foo" } }).chain(
  ({ inputValue: a }) => input().chain(
    ({ inputValue: b }) => span(["Combined text: ", a, b])
  )
);
```

However, the above code is very awkward as each invocation of `chain`
adds an extra layer of nesting. To solve the problem we use
generators.

```typescript
do(function*() {
  const {inputValue: a} = yield input();
  const {inputValue: b} = yield input();
  yield span(["Combined text: ", a, b]);
});
```

That is a lot easier to read! The `do` function works like this: for
every `yield`ed value it calls `chain` with a function that continues
the generator function with the value that `chain` passes it. So, when
we `yield` a `Component<A>` we will get an `A` back.

### `loop`

Sometimes situations arise where there is a cyclic dependency between
two components.

For instance, you may have a function that creates a component that
shows the value of an input string-value behavior and outputs a
string-valued behavior.

```typescript
const myComponent = (b: Behavior<string>) => span(b).chain((_) => input());
```

Now we'd have a cyclic dependency if we wanted to construct two of
these views so that the first showed the output from the second and
the second showed output from the first. With `loop` we can do it like
this:

```typescript
loop(({output1, output2}) => do(function*() {
  const output1_ = yield myComponent(output2);
  const output2_ = yield myComponent(output1);
  return {output1: output1_, output2: output2_};
}));
```

The `loop` functional seems pretty magical. It has the following
signature (slightly simplified):

```ts
loop<A extends ReactiveObject>(f: (a: A) => Component<A>): Component<A>
```

I.e. `loop` takes a function that returns a component whose output has
the same type as the argument to the function. `loop` then passes the
output in as argument to the function. That is, `f` will as argument
receive the output from the component it returns. The only restriction
is that the output from the component must be an object with streams
and/or behaviors as values.

Visually it looks like this.

![loop figure](https://rawgit.com/funkia/funnel/master/figures/component-loop.svg)

## Contributing

Funnel is developed by Funkia. We develop functional libraries. You
can be a part of it too. Share your feedback and ideas. We also love
PRs.

Run tests once with the below command. It will additionally generate
an HTML coverage report in `./coverage`.

```sh
npm test
```

Continuously run the tests with

```sh
npm run test-watch
```
