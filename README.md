# think

Javascript template binding library, which simply binds a string with json.

``` bash
  var out = $t.render("<div>{{name}} loves think.</div>", { name: 'John' });
  alert (out);
  // alerts "John loves think."
```

## Table of contents

 - [Repeat](#repeat)
 - [Expression](#expression)
 - [Box](#box)

## Repeat

You can repeat templates, as:

``` bash
  var template = "<ul> \
    {% repeat fruits %} \
    <li style='color: {{color}}'>{{name}}</li> \
    {% endrepeat %} \
  </ul>";
  
  var out = $t.render(template, [
    {name: "Orange", color: 'orange'},
    {name: "Apple", color: 'red'},
    {name: "Mango", color: 'yellow'}
  ]);
  
  // displays fruits with their colors

```

repeat templates can also be nested within each other:

``` bash
  var template = "<ul> \
    {% repeat.a fruits %} \
    <li style='color: {{color}}'> \
      {{name}} \
      <i> \
        {% repeat.b likedBy %} \
          {{likedBy}} \
        {% endrepeat.b %} \
      </i> \
    </li> \
    {% endrepeat.a %} \
  </ul>";
  
  var out = $t.render(template, [
    {name: "Orange", color: 'orange', likedBy: ['John', 'Max']},
    {name: "Apple", color: 'red', likedBy: ['John']},
    {name: "Mango", color: 'yellow', likedBy: []}
  ]);
  
  // displays fruits with their colors

```

## Expression

You can write javascript code also in expression:

``` bash
  var out = $t.render("<div>Double of {{num}} is {{__num__ * 2}}.</div>", { num: 8 });
  alert (out);
  // alerts "Double of 8 is 16."
```

## Box

Box wraps the template and data, which can be set to auto update at a regular interval

``` bash
  {% box http://thinkweb.googlecode.com/svn/trunk/python/web/web_support/person.json autoupdate %}
  <h1>Persons</h1>
  <ul>
    {% repeat data %}
     <li>{{name}} : {{age}}</li>
    {% endrepeat %}
  </ul>
  {% endbox %}
  
  /*
    Displays
    
    Persons
     John : 21
     Michael : 23
     Kathy : 22
     Russell : 32
     
    and, autoupdates it every 10s
  */
```
