DogPopulationFrontend
=====================

DogPopulationFrontend is a tool to visualize pedigrees stored and served through DogPopulationService, a Neo4j graph database with custom HTTP JSON endpoints.

![Screenshot](https://raw.github.com/NKK-IT-Utvikling/DogPopulationFrontend/master/screenshot.png)

### Dependencies

* DogPopulationService
* DogIdMapperService (for RegNo-search)
** DogPopulationFrontend will work without DogIdMapper, but only for searches using UUID

### Installation

Serve the files with your favorite server software, and set up the references to the backend services.

#### Setup

Change the URL-variable in main.js to point to the correct server address for the DogPopulationService.

Currently, the different services are expected to live at:

* http://your.url/ <-- index.html
* http://your.url/dogpopulation/pedigree/ <-- DogPopulationService
* http://your.url/test/dogid/find <-- DogIdMapperService
