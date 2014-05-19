# think

Javascript template binding library, which simply binds a string with json.

```
  var out = $t.render("<div>{{name}} loves think.</div>", { name: 'John' });
  alert (out);
  \\ alerts "John loves think."
```
  
alerts, John loves think.

Think also provide some of the inbuilt libraries, as

- repeat, which allows you to repeat template for the data items in context

ex: 

  var html = $t.template.Template("<h3>Favorite books: </h3><ul>{% repeat data %}<li></li>{% endrepeat %}</ul>")
                .render({
                  data: [
                    { name: 'Da Vinci Code' },
                    { name: 'Eragon' }
                  ]
                });
  document.write(html);

will display,

  Favorite Books:
    Da Vinci Code
    Eragon
    
It provides other library as,
- box: to wrap html in a box which can be set to auto update at a fixed interval

Also,
- you can nest libraries, i.e. you can have box in repeat, or may be reverse, repeat in  repeat.
- template can call other javascript functions, as
    ex: $t.template.Template("{{getReadableString('__date__')}}").render({ date: '11/17/2009' })
        will call javascript function getReadableString with argument '11/17/2009' which can return something like
        , 4yrs before.
