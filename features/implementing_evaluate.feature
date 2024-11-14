@evaluate @BDD @mode:parallel
Feature: implementing evaluate

  @timeout:20000 @retries:1
  Scenario: Use evaluate function to manupulate DOM
    Given I go to riverside protal
    When I will be logging in with username and password in enscripted format
    Then I should see the dashboard page
    When I will be manupulating the dashboard welcome text as "Welcome back to Riverside Publications Sunil" 
    Then I will be asserting the updated "Welcome back to Riverside Publications Sunil"
    And I will validate the Notification Center border style
    Then I will navigate to "https://www.google.com/"
