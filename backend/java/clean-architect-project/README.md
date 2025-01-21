Explanation of the Layers

    domain/:

        Purpose: Holds core business logic and entities. This is the heart of your application and should be framework agnostic.

        entities/: Domain model entities (e.g., User, Product, Order). These represent the core concepts of your business.

        exceptions/: Custom exceptions specific to your domain.

        services/: (Optional) Contains domain services with more complex business rules/operations.

    application/:

        Purpose: Defines use cases or interaction flows of the application. This layer coordinates domain entities and uses them to perform operations requested by external systems.

        ports/:

            input/: Interfaces that define the incoming requests (Use Case interfaces, e.g., UserUseCase). The outer layers (like the web layer) call these interfaces.

            output/: Interfaces that define how the use cases communicate with outer layers (e.g., UserRepository, PaymentGateway).

        impl/: Concrete implementations of the use cases (e.g., UserUseCaseImpl). These orchestrate the domain logic.

    infrastructure/:

        Purpose: Houses framework-specific implementations for persistence, web layers, etc. It translates the abstractions defined in the application layer into concrete actions.

        persistence/:

            jpa/:

                entities/: Database-specific entities (JPA annotations). Note that these can be different from your domain entities.

                repositories/: Implementations of the repository pattern for data access, typically using Spring Data JPA (e.g., UserJpaRepository).

                mappers/: Classes responsible for mapping between JPA entities and domain entities (e.g., UserMapper).

            adapters/: Adapters that connect the application layer with the concrete infrastructure implementation (e.g. UserRepositoryAdapter).

        config/: Spring Boot application configuration beans, datasource configs, etc.

        web/:

            controllers/: Spring MVC controllers that handle incoming HTTP requests and orchestrate the application use cases.

            dtos/: Data Transfer Objects (DTOs) for representing request/response payloads.

            mappers/: Classes responsible for mapping between DTOs and domain entities or models.

    MySpringBootApplication.java: This is your Spring Boot application's entry point.

    application.properties or application.yml: Contains your Spring Boot configuration.

    test/:

        Unit Tests: application, domain, infrastructure adapters packages contain tests for their respective units.

        Integration Tests: integration package contains higher level tests to check different modules are working together.

    resources/: Contains configuration files and application related resources.