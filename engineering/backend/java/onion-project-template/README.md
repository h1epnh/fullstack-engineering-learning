# payment-execution-service

Micro service for Vikki digital banking app.

## Directory structure

```text
project  
│
└───api  //Web Controller, Dto and Springboot configuration
│   └─── src
│   │   build.gradle
└─── common // Common Utilities
│   └─── src  
│   │   build.gradle
└─── core  // Enterprise and Application Business Rules and Domain
│   └─── src
│   │   build.gradle
└─── infra // External, DB, UI and Device layer
│   └─── src 
│   │   build.gradle
│build.gradle
│settings.gradle
```

## Formatting

Format by running following command

```bash
./gradlew spotlessApply
```

## How to start payment-execution-service

Start the application by running following command

```bash
./gradlew bootRun
```

## Reference Document

TBD.

### Best practices

- [Rest API URI design best practices](https://galaxyfinx.atlassian.net/l/cp/Yd90Ehwa)

- [API Best Practices](https://galaxyfinx.atlassian.net/l/cp/gUEkkwip)

- [Backend - Coding Standards and Guidelines](https://galaxyfinx.atlassian.net/l/cp/CZFXdhBg)

- [Backend - Design Doc Template](https://galaxyfinx.atlassian.net/l/cp/LDkwPz74)

## Workflows

- [Branching and merging strategy](https://galaxyfinx.atlassian.net/wiki/spaces/EN/pages/79134771/Micro+Services+Release+Pipeline)

- [CICD architechture overview](https://galaxyfinx.atlassian.net/l/cp/3FAVnT71)

## Codeowners

Refer to the folder [.github](./github)

## Pull request template

Update the file [PULL_REQUEST_TEMPLATE.MD](./github/PULL_REQUEST_TEMPLATE.MD)

## Sonar setup

Update the properties `sonar.projectName` and `sonar.projectKey` to service name. For example

```text
property 'sonar.projectName', 'payment-execution-service'
property 'sonar.projectKey', 'payment-execution-service'
```

