var Election = artifacts.require("./Election.sol");

contract("Election", accounts => {
    var electionInstance;

    it("initializws with two candidates", () => {
        return Election.deployed().then((instance) => {
            return instance.candidatesCount();
        }).then(count => {
            assert.equal(count, 2);
        })
    })

    it("it initialises thr candidates with the correct values", () => {
        return Election.deployed().then(instance => {
            electionInstance = instance;
            return electionInstance.candidates(1)
        }).then(candidate => {
            assert.equal(candidate.id, 1, "cantains the correct id");
            assert.equal(candidate.name, "Candidate 1", "containes the correct name");
            assert.equal(candidate.voteCount, 0, "contains the correct voteCOunt");
            return electionInstance.candidates(2);
        }).then(candidate => {
            assert.equal(candidate.id, 2, "cantains the correct id");
            assert.equal(candidate.name, "Candidate 2", "containes the correct name");
            assert.equal(candidate.voteCount, 0, "contains the correct voteCOunt");
        })
    })

    it("allows a voter to cast a vote", () => {
        return Election.deployed().then(instance => {
            electionInstance = instance;
            candidateId = 1;
            return electionInstance.vote(candidateId, { from: accounts[0] });
        }).then(receipt => {
            return electionInstance.voters(accounts[0]);
        }).then(voted => {
            assert(voted, "the voter was marked as voted");
            return electionInstance.candidates(candidateId);
        }).then(candidate => {
            var voteCount = candidate.voteCount;
            assert.equal(voteCount, 1, "incements the candidate's vote count");
        })
    })

    it("throws an exception for invalid candiates", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            return electionInstance.vote(99, { from: accounts[1] })
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return electionInstance.candidates(1);
        }).then(function (candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
            return electionInstance.candidates(2);
        }).then(function (candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
        });
    });

    it("throws an exception for double voting", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            candidateId = 2;
            electionInstance.vote(candidateId, { from: accounts[1] });
            return electionInstance.candidates(candidateId);
        }).then(function (candidate) {
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "accepts first vote");
            // Try to vote again
            return electionInstance.vote(candidateId, { from: accounts[1] });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return electionInstance.candidates(1);
        }).then(function (candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
            return electionInstance.candidates(2);
        }).then(function (candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
        });
    });
})