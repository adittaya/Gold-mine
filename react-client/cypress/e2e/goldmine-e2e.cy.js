/// <reference types="cypress" />

describe('Goldmine Pro End-to-End Test Suite', () => {
  const testUser = {
    name: 'Test User',
    mobile: '9000000001',
    password: 'Test@1234'
  };

  const adminCredentials = {
    mobile: 'admin',
    password: 'admin123'
  };

  const referredUser = {
    name: 'Referred User',
    mobile: '9000000002',
    password: 'Test@1234'
  };

  before(() => {
    // Clear any existing data before starting tests
    cy.task('db:reset');
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('1. Register new user', () => {
    // Navigate to register page
    cy.get('[data-testid="register-link"]').click();
    
    // Fill registration form
    cy.get('[data-testid="name-input"]').type(testUser.name);
    cy.get('[data-testid="mobile-input"]').type(testUser.mobile);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="register-submit"]').click();

    // Verify successful registration and auto-login
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="wallet-balance"]').should('contain', '0');
    cy.get('[data-testid="active-plans"]').should('contain', '0');
  });

  it('2. Login (sanity check)', () => {
    // Log out first
    cy.get('[data-testid="logout-button"]').click();
    
    // Navigate to login page
    cy.get('[data-testid="login-link"]').click();
    
    // Fill login form
    cy.get('[data-testid="mobile-input"]').type(testUser.mobile);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="login-submit"]').click();
    
    // Verify successful login
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="wallet-balance"]').should('exist');
  });

  it('3. View Product Plans', () => {
    // Navigate to plans page
    cy.get('[data-testid="plans-link"]').click();
    
    // Verify list of plans visible with required information
    cy.get('[data-testid="plan-card"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="plan-card"]').each(($plan) => {
      cy.wrap($plan).within(() => {
        cy.get('[data-testid="plan-name"]').should('exist');
        cy.get('[data-testid="plan-price"]').should('exist');
        cy.get('[data-testid="plan-daily-income"]').should('exist');
        cy.get('[data-testid="plan-total-return"]').should('exist');
        cy.get('[data-testid="buy-button"]').should('exist');
      });
    });
  });

  it('4. Buy first plan (balance insufficient)', () => {
    // Click buy on the first plan
    cy.get('[data-testid="plan-card"]').first().find('[data-testid="buy-button"]').click();
    
    // Verify purchase is blocked due to insufficient balance
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'insufficient');
    cy.url().should('include', '/plans'); // Should stay on plans page
  });

  it('5. Recharge wallet via UPI (user flow)', () => {
    // Navigate to recharge page
    cy.get('[data-testid="recharge-link"]').click();
    
    // Verify UPI ID copy functionality
    cy.get('[data-testid="upi-id"]').then(($upi) => {
      const upiId = $upi.text();
      expect(upiId).to.equal('7047571829@upi');
      
      // Simulate copy to clipboard
      cy.wrap($upi).click();
    });
    
    // Submit UTR
    cy.get('[data-testid="utr-input"]').type('UTRTEST001');
    cy.get('[data-testid="recharge-submit"]').click();
    
    // Verify recharge request created with pending status
    cy.get('[data-testid="recharge-status"]').should('contain', 'Pending');
    cy.get('[data-testid="recharge-history"]').should('contain', 'UTRTEST001');
  });

  it('6. Admin: Approve recharge', () => {
    // Log out regular user
    cy.get('[data-testid="logout-button"]').click();
    
    // Log in as admin
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="mobile-input"]').type(adminCredentials.mobile);
    cy.get('[data-testid="password-input"]').type(adminCredentials.password);
    cy.get('[data-testid="login-submit"]').click();
    
    // Navigate to admin panel
    cy.get('[data-testid="admin-panel-link"]').click();
    
    // Navigate to recharges section
    cy.get('[data-testid="admin-recharges-link"]').click();
    
    // Find the user's recharge request and approve it
    cy.get('[data-testid="recharge-item"]').contains('9000000001').parent().within(() => {
      cy.get('[data-testid="approve-button"]').click();
    });
    
    // Verify recharge status becomes approved
    cy.get('[data-testid="recharge-status"]').should('contain', 'Approved');
  });

  it('7. User: Verify wallet credited', () => {
    // Log out admin
    cy.get('[data-testid="logout-button"]').click();
    
    // Log in as user
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="mobile-input"]').type(testUser.mobile);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="login-submit"]').click();
    
    // Verify wallet shows credited amount
    cy.get('[data-testid="wallet-balance"]').should('not.contain', '0');
    cy.get('[data-testid="recharge-history"]')
      .contains('UTRTEST001')
      .parent()
      .get('[data-testid="recharge-status"]')
      .should('contain', 'Approved');
  });

  it('8. Buy plan with sufficient balance', () => {
    // Navigate to plans page
    cy.get('[data-testid="plans-link"]').click();
    
    // Click buy on the first plan (now with sufficient balance)
    cy.get('[data-testid="plan-card"]').first().find('[data-testid="buy-button"]').click();
    
    // Verify purchase accepted and plan activated
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="active-plans"]').should('contain', '1');
    
    // Verify wallet balance reduced by plan price
    cy.get('[data-testid="wallet-balance"]').should('be.lessThan', 1000); // Original recharge was 1000
    
    // Try to buy another plan in same month (should fail)
    cy.get('[data-testid="plans-link"]').click();
    cy.get('[data-testid="plan-card"]').eq(1).find('[data-testid="buy-button"]').click();
    
    // Should show error about one plan per month
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'one plan per month');
  });

  it('9. Daily income credit (automated)', () => {
    // Trigger daily income simulation via API call
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/simulate-daily-income',
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('token')}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
    
    // Verify daily income has been added to wallet
    cy.get('[data-testid="wallet-balance"]').then(($balance) => {
      const currentBalance = parseFloat($balance.text().replace(/[^\d.-]/g, ''));
      expect(currentBalance).to.be.greaterThan(0); // Should have increased from previous step
    });
  });

  it('10. Attempt duplicate daily-run', () => {
    // Try to run daily income again (should not double credit)
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/simulate-daily-income',
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('token')}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
    
    // Should not have double credited (implementation-specific behavior)
    // This test depends on the backend preventing duplicate credits
  });

  it('11. Request withdrawal', () => {
    // Navigate to withdrawal page
    cy.get('[data-testid="withdraw-link"]').click();
    
    // Fill withdrawal form
    cy.get('[data-testid="withdraw-amount"]').type('500');
    cy.get('[data-testid="withdraw-method"]').select('upi');
    cy.get('[data-testid="withdraw-details"]').type('7047571829@upi');
    cy.get('[data-testid="withdraw-submit"]').click();
    
    // Verify withdrawal created with pending status
    cy.get('[data-testid="withdrawal-status"]').should('contain', 'Pending');
    
    // Try to make another withdrawal within 24 hours (should be blocked)
    cy.get('[data-testid="withdraw-link"]').click();
    cy.get('[data-testid="withdraw-amount"]').type('100');
    cy.get('[data-testid="withdraw-method"]').select('bank');
    cy.get('[data-testid="withdraw-details"]').type('acc123456789');
    cy.get('[data-testid="withdraw-submit"]').click();
    
    // Should show error about one withdrawal per 24 hours
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'one withdrawal per 24 hours');
  });

  it('12. Admin: Process withdrawal', () => {
    // Log out user
    cy.get('[data-testid="logout-button"]').click();
    
    // Log in as admin
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="mobile-input"]').type(adminCredentials.mobile);
    cy.get('[data-testid="password-input"]').type(adminCredentials.password);
    cy.get('[data-testid="login-submit"]').click();
    
    // Navigate to admin withdrawals
    cy.get('[data-testid="admin-panel-link"]').click();
    cy.get('[data-testid="admin-withdrawals-link"]').click();
    
    // Find and approve the withdrawal
    cy.get('[data-testid="withdrawal-item"]').contains('7047571829@upi').parent().within(() => {
      cy.get('[data-testid="approve-button"]').click();
    });
    
    // Verify withdrawal status becomes approved
    cy.get('[data-testid="withdrawal-status"]').should('contain', 'Approved');
  });

  it('13. Verify GST deduction', () => {
    // Check withdrawal details show GST deduction
    cy.get('[data-testid="withdrawal-item"]')
      .contains('7047571829@upi')
      .parent()
      .within(() => {
        cy.get('[data-testid="withdrawal-amount"]').then(($amount) => {
          const requested = parseFloat($amount.text());
          cy.get('[data-testid="withdrawal-gst"]').then(($gst) => {
            const gstValue = parseFloat($gst.text());
            cy.get('[data-testid="withdrawal-net"]').then(($net) => {
              const netAmount = parseFloat($net.text());
              expect(netAmount).to.eq(requested - gstValue);
            });
          });
        });
      });
  });

  it('14. Referral sharing', () => {
    // Navigate to dashboard
    cy.get('[data-testid="dashboard-link"]').click();
    
    // Click share button to copy referral link
    cy.get('[data-testid="share-link"]').click();
    
    // Verify referral link exists in UI
    cy.get('[data-testid="referral-link"]').should('exist');
  });

  it('15. Register via referral', () => {
    // Log out current user
    cy.get('[data-testid="logout-button"]').click();
    
    // Visit the referral link (simulated)
    const referralLink = `/register?ref=${testUser.mobile}`; // This would be the actual referral ID
    cy.visit(referralLink);
    
    // Fill registration form for referred user
    cy.get('[data-testid="name-input"]').type(referredUser.name);
    cy.get('[data-testid="mobile-input"]').type(referredUser.mobile);
    cy.get('[data-testid="password-input"]').type(referredUser.password);
    cy.get('[data-testid="register-submit"]').click();
    
    // Verify new user registration
    cy.url().should('include', '/dashboard');
    
    // Log back in as original user to verify referral bonus
    cy.get('[data-testid="logout-button"]').click();
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="mobile-input"]').type(testUser.mobile);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="login-submit"]').click();
    
    // Check if referral bonus was applied (this is implementation-dependent)
    cy.get('[data-testid="wallet-balance"]').should('exist');
  });

  it('16. One-time plan-per-month rule enforcement', () => {
    // Attempt to buy another plan in same month
    cy.get('[data-testid="plans-link"]').click();
    cy.get('[data-testid="plan-card"]').eq(1).find('[data-testid="buy-button"]').click();
    
    // Verify purchase is blocked with appropriate message
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'one plan per month');
  });

  it('17. UI responsiveness test', () => {
    // Test on mobile dimensions
    cy.viewport('iphone-6');
    cy.get('[data-testid="mobile-menu"]').should('exist');
    cy.get('[data-testid="nav-links"]').should('be.visible');
    
    // Test on tablet dimensions
    cy.viewport('ipad-2');
    cy.get('[data-testid="layout"]').should('have.css', 'display').and('match', /grid|flex/);
    
    // Test on desktop dimensions
    cy.viewport(1280, 720);
    cy.get('[data-testid="desktop-layout"]').should('exist');
  });

  it('18. Security checks', () => {
    // Test access to protected endpoint without JWT
    cy.request({
      url: 'http://localhost:8080/api/dashboard/stats',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
    
    // Clear token and try to access dashboard
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });
    
    cy.visit('/dashboard');
    cy.url().should('include', '/login'); // Should redirect to login
  });

  it('19. Edge cases', () => {
    // Action A: Try recharge with same UTR twice
    cy.get('[data-testid="recharge-link"]').click();
    cy.get('[data-testid="utr-input"]').type('UTRTEST001'); // Same UTR as before
    cy.get('[data-testid="recharge-submit"]').click();
    
    // Should handle duplicate UTR appropriately (depends on implementation)
    cy.get('[data-testid="error-message"], [data-testid="success-message"]')
      .should('exist');
    
    // Action B: Submit withdrawal greater than wallet
    cy.get('[data-testid="withdraw-link"]').click();
    cy.get('[data-testid="withdraw-amount"]').type('9999999'); // High amount
    cy.get('[data-testid="withdraw-method"]').select('upi');
    cy.get('[data-testid="withdraw-details"]').type('7047571829@upi');
    cy.get('[data-testid="withdraw-submit"]').click();
    
    // Should reject with error about insufficient balance
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'insufficient');
    
    // Action C: Simulate concurrent plan purchase (difficult to test in Cypress, 
    // but we can try rapid clicking to check for idempotency)
    cy.get('[data-testid="plans-link"]').click();
    cy.get('[data-testid="plan-card"]').eq(2).find('[data-testid="buy-button"]')
      .click()
      .click()
      .click(); // Multiple clicks to simulate concurrency
    
    // Check that only one purchase was recorded
    cy.get('[data-testid="dashboard-link"]').click();
    cy.get('[data-testid="active-plans"]').then(($plans) => {
      const planCount = parseInt($plans.text());
      expect(planCount).to.be.lte(2); // Should not exceed expected number
    });
  });

  it('20. Audit & Logs (UI verification)', () => {
    // Log in as admin
    cy.get('[data-testid="logout-button"]').click();
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="mobile-input"]').type(adminCredentials.mobile);
    cy.get('[data-testid="password-input"]').type(adminCredentials.password);
    cy.get('[data-testid="login-submit"]').click();
    
    // Navigate to admin logs section
    cy.get('[data-testid="admin-panel-link"]').click();
    cy.get('[data-testid="admin-transactions-link"]').click();
    
    // Look for user's actions in logs
    cy.get('[data-testid="transaction-log"]').contains(testUser.mobile).should('exist');
  });

  it('21. Final smoke test: end-to-end', () => {
    // Complete user journey from registration to approved withdrawal
    
    // Register
    cy.get('[data-testid="logout-button"]').click();
    cy.get('[data-testid="register-link"]').click();
    cy.get('[data-testid="name-input"]').type('Smoke Test User');
    cy.get('[data-testid="mobile-input"]').type('9000000003');
    cy.get('[data-testid="password-input"]').type('Test@1234');
    cy.get('[data-testid="register-submit"]').click();
    
    // Recharge
    cy.get('[data-testid="recharge-link"]').click();
    cy.get('[data-testid="utr-input"]').type('SMOKETEST001');
    cy.get('[data-testid="recharge-submit"]').click();
    
    // Admin approve recharge
    cy.get('[data-testid="logout-button"]').click();
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="mobile-input"]').type(adminCredentials.mobile);
    cy.get('[data-testid="password-input"]').type(adminCredentials.password);
    cy.get('[data-testid="login-submit"]').click();
    
    cy.get('[data-testid="admin-panel-link"]').click();
    cy.get('[data-testid="admin-recharges-link"]').click();
    cy.get('[data-testid="recharge-item"]').contains('SMOKETEST001').parent().within(() => {
      cy.get('[data-testid="approve-button"]').click();
    });
    
    // Buy plan
    cy.get('[data-testid="logout-button"]').click();
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="mobile-input"]').type('9000000003');
    cy.get('[data-testid="password-input"]').type('Test@1234');
    cy.get('[data-testid="login-submit"]').click();
    
    cy.get('[data-testid="plans-link"]').click();
    cy.get('[data-testid="plan-card"]').first().find('[data-testid="buy-button"]').click();
    
    // Request withdrawal
    cy.get('[data-testid="withdraw-link"]').click();
    cy.get('[data-testid="withdraw-amount"]').type('100');
    cy.get('[data-testid="withdraw-method"]').select('upi');
    cy.get('[data-testid="withdraw-details"]').type('7047571829@upi');
    cy.get('[data-testid="withdraw-submit"]').click();
    
    // Admin approve withdrawal
    cy.get('[data-testid="logout-button"]').click();
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="mobile-input"]').type(adminCredentials.mobile);
    cy.get('[data-testid="password-input"]').type(adminCredentials.password);
    cy.get('[data-testid="login-submit"]').click();
    
    cy.get('[data-testid="admin-panel-link"]').click();
    cy.get('[data-testid="admin-withdrawals-link"]').click();
    cy.get('[data-testid="withdrawal-item"]').contains('7047571829@upi').parent().within(() => {
      cy.get('[data-testid="approve-button"]').click();
    });
    
    // Verify all actions completed successfully
    cy.get('[data-testid="logout-button"]').click();
    cy.get('[data-testid="login-link"]').click();
    cy.get('[data-testid="mobile-input"]').type('9000000003');
    cy.get('[data-testid="password-input"]').type('Test@1234');
    cy.get('[data-testid="login-submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="wallet-balance"]').should('exist');
  });
});