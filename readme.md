![J316 Translator](doc/logo.png)

[![Code Climate](https://codeclimate.com/github/lagranovskiy/j316-translator/badges/gpa.svg)](https://codeclimate.com/github/lagranovskiy/j316-translator)
[![Dev Dependency Status](https://david-dm.org/lagranovskiy/j316-translator.png)](https://david-dm.org/lagranovskiy/j316-translator)

# J316 Translator Readme

The J316 Translator is a small application that makes it possible for multilingual worship visitors to read a translation of sermons in his native language. It supports the visitor by understanding and gives him a possibility to ask a quastion or note the translator about difficult sentence or unclear meaning of it.

## Info Pages
* [Functionality Information](doc/functionality.md)
* [Technical solution overview](doc/technical.md)


## Quick Functionality overview
* Quick switching of translation language
* Translator recieves his own translated text
* Caching of translations and messages
* Voice recognition (unstable)
* Visitors can ask questions and recieve answers
* Visitors can reask question
* Multi Translator mode
* Question acknowligement by answering in multi translator mode
* Currenly visitios overview
* Parsing and lookup of bible verses


## Wished future features
* Communication between multiple translators 
* Forwarding of question that was not consumed to the email of responsible person
* Voice recognision with Yandex Speech API

## Known issues
* Android standard browser dont display icons.
* Verse parsing is actually hard coded to a single versification system. It leads to wrong lookups by translations that use other versification.
