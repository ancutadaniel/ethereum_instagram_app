const Instagram = artifacts.require('Instagram');
const chai = require('chai');
const { assert } = require('chai');

chai.use(require('chai-as-promised')).should();

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract('Instagram', function (accounts) {
  let instagram;

  before(async () => {
    instagram = await Instagram.deployed();
  });

  describe('deployment of the contract', async () => {
    it('contract deployed successfully and has a address', async () => {
      const address = await instagram.address;

      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
      assert.isString(address);
    });

    it('check the name of the contract', async () => {
      const name = await instagram.name();
      assert.equal(name, 'Instagram', 'Contract has no name set');
    });

    it('should assert true', async function () {
      await Instagram.deployed();
      return assert.isTrue(true);
    });

    it('should have a owner', async () => {
      const owner = await instagram.owner();
      assert.equal(owner, accounts[0], 'Contract has no owner set');
    });
  });

  describe('images', async () => {
    let result, count;

    before(async () => {
      result = await instagram.uploadImage('abc123', 'First image', {
        from: accounts[1],
        value: web3.utils.toWei('0.1', 'ether'),
      });
      count = await instagram.imageCount();
    });

    it('creates images', async () => {
      // success
      assert.equal(count, '1', 'should have count incremented');

      // event
      const event = result.logs[0].args;

      assert.equal(event.id.toString(), count.toString());
      assert.equal(event.hash, 'abc123');
      assert.equal(event.description, 'First image');
      assert.equal(event.tipAmount, web3.utils.toWei('0.1', 'ether'));
      assert.equal(event.author, accounts[1]);

      // fail
      await instagram.uploadImage('', 'First image', {
        from: accounts[1],
        value: 0,
      }).should.be.rejected;
      await instagram.uploadImage('abc123', '', {
        from: accounts[1],
        value: 0,
      }).should.be.rejected;
    });

    it('lists images', async () => {
      const image = await instagram.images(count);
      assert.equal(image.id.toString(), count.toString());
      assert.equal(image.hash, 'abc123');
      assert.equal(image.description, 'First image');
      assert.equal(image.tipAmount, web3.utils.toWei('0.1', 'ether'));
      assert.equal(image.author, accounts[1]);
    });

    it('allows user to tip the images', async () => {
      // track balance
      let oldBalance;
      oldBalance = await web3.eth.getBalance(accounts[1]);
      oldBalance = new web3.utils.BN(oldBalance);

      result = await instagram.tipImage(count, {
        from: accounts[0],
        value: web3.utils.toWei('1', 'ether'),
      });

      const event = result.logs[0].args;
      assert.equal(event.id.toString(), count.toString());
      assert.equal(event.tipAmount, web3.utils.toWei('1', 'ether'));
      assert.equal(event.sender, accounts[0]);

      // check new balance
      let newBalance;
      newBalance = await web3.eth.getBalance(accounts[1]);
      newBalance = new web3.utils.BN(newBalance);

      let price;
      price = await web3.utils.toWei('1', 'ether');
      price = new web3.utils.BN(price);

      // Calculate balance with add fct from BN  - old balance + price
      const expectedBalance = oldBalance.add(price);
      assert.equal(
        newBalance.toString(),
        expectedBalance.toString(),
        'balance should be updated'
      );

      // fail
      await instagram.tipImage(99, {
        from: accounts[1],
        value: web3.utils.toWei('1', 'ether'),
      }).should.be.rejected;
    });
  });
});
