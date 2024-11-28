@eCommerce @BDD @mode:parallel
Feature: greenKart eCommerce

  @gk_E2e @timeout:20000 @retries:2
  Scenario Outline: Add <items> to cart using data driven approach
    Given I open url "https://rahulshettyacademy.com/seleniumPractise/#"
    When I will be searching for the "<items>" and adding to the cart

    Examples:
      | items    |
      | Beetroot |
      | Carrot   |
      | Tomato   |
      | Beans    |
      # | Guava    |

  @gk_E2e @timeout:20000 @retries:2
  Scenario Outline: Add product to cart
    Given I open url "https://rahulshettyacademy.com/seleniumPractise/#"
    When I will be searching for the "<items>" and adding to the cart
    # title-format: item - <items>

    Examples:
      | items    |
      | Beetroot |
      | Carrot   |
      | Tomato   |
      | Beans    |
