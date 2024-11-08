@eCommerce @BDD
Feature: greenKart eCommerce

  @gk_E2e
  Scenario Outline: Add products to cart using data driven approach
    Given I open url "https://rahulshettyacademy.com/seleniumPractise/#"
    When I will be searching for the "<items>" and adding to the cart

    Examples:
      | items    |
      | Beetroot |
      | Carrot   |
      | Tomato   |
      | Beans    |
