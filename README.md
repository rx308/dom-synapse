```markdown
# DomSynapse

Легковесный JavaScript фреймворк для декларативной обработки DOM-событий.

## Установка

npm install dom-synapse
```

## Быстрый старт

```html
<!-- Подключение -->
<script src="dom-synapse.all.umd.js"></script>

<!-- Использование -->
<button data-synapse="click-me">Click me!</button>

<script>
    const synapse = DomSynapse.create().observe();
  
    synapse.connect('click-me', (element) => {
        console.log('Button clicked!', element);
    });
</script>
```

## Основные методы

- `DomSynapse.create()` - создать экземпляр
- `.observe()` - начать наблюдение за событиями
- `.connect(event, callback, type)` - подключить обработчик
- `.use(plugin)` - использовать плагин

## Лицензия

MIT