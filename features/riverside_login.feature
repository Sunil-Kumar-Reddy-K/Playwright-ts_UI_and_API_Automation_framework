@crypto @BDD @mode:parallel
Feature: implementing crypto

  @timeout:20000 @retries:2
  Scenario: Use crypto enscription to login
    Given I go to riverside protal
    When I will be logging in with username and password in enscripted format
    Then I should see the dashboard page
    When I will be clicking on Examinees header
    Then I will be at the Examinee management page
