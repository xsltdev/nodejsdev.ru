# Exploring Validation and Serialization

Fastify is secure and fast, but that doesn’t protect it from misuse. This chapter will teach you how to implement secure endpoints with input validation and make them faster with the serialization process.

This framework provides all the tools you need to take advantage of these two critical steps, which will support you while exposing straightforward API interfaces and enable your clients to consume them.

You will learn how to use and configure Fastify’s components in order to control and adapt the default setup to your application logic.

This is the learning path we will cover in this chapter:

-   Understanding validation and serialization
-   Understanding the validation process
-   Customizing the validator compiler
-   Managing the validator compiler
-   Understanding the serialization process

## Technical requirements

As mentioned in the previous chapters, you will need the following:

-   A working Node.js 18 installation
-   A text editor to try the example code
-   An HTTP client to test out code, such as CURL or Postman

All the snippets in this chapter are on GitHub at <https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main/Chapter%205>.

## Understanding validation and serialization

Fastify has been built with a focus on the developer’s experience, and on reducing the developer effort needed to draft a new project. For this reason, Fastify has built-in features to reduce the following burdens:

-   Validating the user’s input
-   Filtering the server’s output

The aim is to find solutions for and prevent the most common security attacks, such as code injection or sensitive data exposure. The answer is declaring the expected input and output data format for every route. Therefore, the validation and serialization processes have been introduced into the framework by design:

![Figure 5.1 – The Validation and Serialization phases](validation-serialization1.png)

<center>Figure 5.1 – The Validation and Serialization phases</center>

This preceding diagram shows the request lifecycle steps’ macro architecture, which you read about in detail in [_Chapter 4_](./hooks.md).

The **Validation** phase happens when the **HTTP Request** comes into the server. It allows you to approve or deny access to the **Business Logic** step.

**119**
