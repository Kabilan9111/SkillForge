const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock DSA problems database
const DSA_PROBLEMS = {
    'Arrays': [
        { id: 'arr-1', name: 'Two Sum', difficulty: 'easy', topic: 'Arrays', description: 'Find two numbers that add up to a target', examples: ['Input: [2,7,11,15], target = 9'], constraints: ['2 <= nums.length <= 10^4'] },
        { id: 'arr-2', name: 'Container With Most Water', difficulty: 'medium', topic: 'Arrays', description: 'Find container with maximum water', examples: ['Input: [1,8,6,2,5,4,8,3,7]'], constraints: ['n >= 2'] },
        { id: 'arr-3', name: 'Trapping Rain Water', difficulty: 'hard', topic: 'Arrays', description: 'Calculate trapped rainwater', examples: ['Input: [0,1,0,2,1,0,1,3,2,1,2,1]'], constraints: ['0 <= height.length <= 2 * 10^4'] }
    ],
    'Strings': [
        { id: 'str-1', name: 'Valid Palindrome', difficulty: 'easy', topic: 'Strings', description: 'Check if string is a palindrome', examples: ['Input: "A man, a plan, a canal: Panama"'], constraints: ['1 <= s.length <= 2 * 10^5'] },
        { id: 'str-2', name: 'Longest Substring Without Repeating', difficulty: 'medium', topic: 'Strings', description: 'Find longest substring without repeating characters', examples: ['Input: "abcabcbb"'], constraints: ['0 <= s.length <= 5 * 10^4'] },
        { id: 'str-3', name: 'Minimum Window Substring', difficulty: 'hard', topic: 'Strings', description: 'Find minimum window substring', examples: ['Input: s = "ADOBECODEBANC", t = "ABC"'], constraints: ['m == s.length'] }
    ],
    'Stack': [
        { id: 'stk-1', name: 'Valid Parentheses', difficulty: 'easy', topic: 'Stack', description: 'Check if parentheses are balanced', examples: ['Input: "()[]{}"'], constraints: ['1 <= s.length <= 10^4'] },
        { id: 'stk-2', name: 'Min Stack', difficulty: 'medium', topic: 'Stack', description: 'Implement stack with getMin() in O(1)', examples: ['MinStack minStack = new MinStack()'], constraints: ['Methods called at most 3 * 10^4 times'] },
        { id: 'stk-3', name: 'Largest Rectangle in Histogram', difficulty: 'hard', topic: 'Stack', description: 'Find largest rectangle area', examples: ['Input: heights = [2,1,5,6,2,3]'], constraints: ['1 <= heights.length <= 10^5'] }
    ],
    'Queue': [
        { id: 'que-1', name: 'Implement Queue using Stacks', difficulty: 'easy', topic: 'Queue', description: 'Implement queue using two stacks', examples: ['MyQueue queue = new MyQueue()'], constraints: ['At most 100 operations'] },
        { id: 'que-2', name: 'Sliding Window Maximum', difficulty: 'hard', topic: 'Queue', description: 'Find maximum in sliding window', examples: ['Input: nums = [1,3,-1,-3,5,3,6,7], k = 3'], constraints: ['1 <= nums.length <= 10^5'] }
    ],
    'Linked List': [
        { id: 'll-1', name: 'Reverse Linked List', difficulty: 'easy', topic: 'Linked List', description: 'Reverse a singly linked list', examples: ['Input: 1->2->3->4->5->NULL'], constraints: ['Number of nodes: [0, 5000]'] },
        { id: 'll-2', name: 'Merge Two Sorted Lists', difficulty: 'easy', topic: 'Linked List', description: 'Merge two sorted linked lists', examples: ['Input: list1 = [1,2,4], list2 = [1,3,4]'], constraints: ['Number of nodes: [0, 50]'] },
        { id: 'll-3', name: 'LRU Cache', difficulty: 'medium', topic: 'Linked List', description: 'Implement LRU cache', examples: ['LRUCache lRUCache = new LRUCache(2)'], constraints: ['1 <= capacity <= 3000'] },
        { id: 'll-4', name: 'Merge K Sorted Lists', difficulty: 'hard', topic: 'Linked List', description: 'Merge k sorted linked lists', examples: ['Input: [[1,4,5],[1,3,4],[2,6]]'], constraints: ['k == lists.length'] }
    ],
    'Trees': [
        { id: 'tr-1', name: 'Invert Binary Tree', difficulty: 'easy', topic: 'Trees', description: 'Invert a binary tree', examples: ['Input: [4,2,7,1,3,6,9]'], constraints: ['Number of nodes: [0, 100]'] },
        { id: 'tr-2', name: 'Validate BST', difficulty: 'medium', topic: 'Trees', description: 'Validate if tree is BST', examples: ['Input: [2,1,3]'], constraints: ['Number of nodes: [1, 10^4]'] },
        { id: 'tr-3', name: 'Lowest Common Ancestor', difficulty: 'medium', topic: 'Trees', description: 'Find LCA of two nodes', examples: ['Input: root = [3,5,1,6,2,0,8]'], constraints: ['Number of nodes: [2, 10^5]'] },
        { id: 'tr-4', name: 'Binary Tree Maximum Path Sum', difficulty: 'hard', topic: 'Trees', description: 'Find maximum path sum', examples: ['Input: [-10,9,20,null,null,15,7]'], constraints: ['Number of nodes: [1, 3 * 10^4]'] }
    ],
    'Tries': [
        { id: 'tri-1', name: 'Implement Trie', difficulty: 'medium', topic: 'Tries', description: 'Implement a trie (prefix tree)', examples: ['Trie trie = new Trie()'], constraints: ['At most 3 * 10^4 operations'] },
        { id: 'tri-2', name: 'Word Search II', difficulty: 'hard', topic: 'Tries', description: 'Find all words in board', examples: ['Input: board = [["o","a","a","n"]]'], constraints: ['m == board.length'] }
    ],
    'HashMaps': [
        { id: 'hm-1', name: 'Group Anagrams', difficulty: 'medium', topic: 'HashMaps', description: 'Group strings that are anagrams', examples: ['Input: ["eat","tea","tan","ate"]'], constraints: ['1 <= strs.length <= 10^4'] },
        { id: 'hm-2', name: 'Subarray Sum Equals K', difficulty: 'medium', topic: 'HashMaps', description: 'Find total number of subarrays', examples: ['Input: nums = [1,1,1], k = 2'], constraints: ['1 <= nums.length <= 2 * 10^4'] },
        { id: 'hm-3', name: 'Longest Consecutive Sequence', difficulty: 'medium', topic: 'HashMaps', description: 'Find longest consecutive sequence', examples: ['Input: [100,4,200,1,3,2]'], constraints: ['0 <= nums.length <= 10^5'] }
    ],
    'Searching': [
        { id: 'sea-1', name: 'Binary Search', difficulty: 'easy', topic: 'Searching', description: 'Implement binary search', examples: ['Input: nums = [-1,0,3,5,9,12], target = 9'], constraints: ['1 <= nums.length <= 10^4'] },
        { id: 'sea-2', name: 'Search in Rotated Array', difficulty: 'medium', topic: 'Searching', description: 'Search in rotated sorted array', examples: ['Input: nums = [4,5,6,7,0,1,2], target = 0'], constraints: ['1 <= nums.length <= 5000'] },
        { id: 'sea-3', name: 'Median of Two Sorted Arrays', difficulty: 'hard', topic: 'Searching', description: 'Find median of two sorted arrays', examples: ['Input: nums1 = [1,3], nums2 = [2]'], constraints: ['nums1.length + nums2.length >= 1'] }
    ],
    'Sorting': [
        { id: 'srt-1', name: 'Merge Intervals', difficulty: 'medium', topic: 'Sorting', description: 'Merge overlapping intervals', examples: ['Input: [[1,3],[2,6],[8,10],[15,18]]'], constraints: ['1 <= intervals.length <= 10^4'] },
        { id: 'srt-2', name: 'Meeting Rooms II', difficulty: 'medium', topic: 'Sorting', description: 'Find minimum meeting rooms needed', examples: ['Input: [[0,30],[5,10],[15,20]]'], constraints: ['1 <= intervals.length <= 10^4'] },
        { id: 'srt-3', name: 'Largest Number', difficulty: 'medium', topic: 'Sorting', description: 'Arrange numbers to form largest number', examples: ['Input: [10,2]'], constraints: ['1 <= nums.length <= 100'] }
    ],
    'Recursion': [
        { id: 'rec-1', name: 'Generate Parentheses', difficulty: 'medium', topic: 'Recursion', description: 'Generate all valid parentheses', examples: ['Input: n = 3'], constraints: ['1 <= n <= 8'] },
        { id: 'rec-2', name: 'Permutations', difficulty: 'medium', topic: 'Recursion', description: 'Generate all permutations', examples: ['Input: [1,2,3]'], constraints: ['1 <= nums.length <= 6'] },
        { id: 'rec-3', name: 'N-Queens', difficulty: 'hard', topic: 'Recursion', description: 'Solve N-Queens problem', examples: ['Input: n = 4'], constraints: ['1 <= n <= 9'] }
    ],
    'Greedy': [
        { id: 'gre-1', name: 'Jump Game', difficulty: 'medium', topic: 'Greedy', description: 'Check if can reach last index', examples: ['Input: [2,3,1,1,4]'], constraints: ['1 <= nums.length <= 10^4'] },
        { id: 'gre-2', name: 'Gas Station', difficulty: 'medium', topic: 'Greedy', description: 'Find starting gas station', examples: ['Input: gas = [1,2,3,4,5]'], constraints: ['n == gas.length'] },
        { id: 'gre-3', name: 'Meeting Rooms', difficulty: 'easy', topic: 'Greedy', description: 'Check if person can attend all meetings', examples: ['Input: [[0,30],[5,10]]'], constraints: ['0 <= intervals.length <= 10^4'] }
    ],
    'Dynamic Programming': [
        { id: 'dp-1', name: 'Climbing Stairs', difficulty: 'easy', topic: 'Dynamic Programming', description: 'Count ways to climb stairs', examples: ['Input: n = 2'], constraints: ['1 <= n <= 45'] },
        { id: 'dp-2', name: 'Coin Change', difficulty: 'medium', topic: 'Dynamic Programming', description: 'Find minimum coins needed', examples: ['Input: coins = [1,2,5], amount = 11'], constraints: ['1 <= coins.length <= 12'] },
        { id: 'dp-3', name: 'Longest Increasing Subsequence', difficulty: 'medium', topic: 'Dynamic Programming', description: 'Find LIS length', examples: ['Input: [10,9,2,5,3,7,101,18]'], constraints: ['1 <= nums.length <= 2500'] },
        { id: 'dp-4', name: 'Edit Distance', difficulty: 'hard', topic: 'Dynamic Programming', description: 'Find minimum edit distance', examples: ['Input: word1 = "horse", word2 = "ros"'], constraints: ['0 <= word1.length, word2.length <= 500'] }
    ],
    'Graphs': [
        { id: 'gr-1', name: 'Number of Islands', difficulty: 'medium', topic: 'Graphs', description: 'Count number of islands', examples: ['Input: grid = [["1","1","0"],["1","1","0"]]'], constraints: ['m == grid.length'] },
        { id: 'gr-2', name: 'Clone Graph', difficulty: 'medium', topic: 'Graphs', description: 'Clone an undirected graph', examples: ['Input: adjList = [[2,4],[1,3],[2,4],[1,3]]'], constraints: ['Number of nodes: [0, 100]'] },
        { id: 'gr-3', name: 'Course Schedule', difficulty: 'medium', topic: 'Graphs', description: 'Check if can finish all courses', examples: ['Input: numCourses = 2, prerequisites = [[1,0]]'], constraints: ['1 <= numCourses <= 2000'] },
        { id: 'gr-4', name: 'Word Ladder', difficulty: 'hard', topic: 'Graphs', description: 'Find shortest transformation sequence', examples: ['Input: beginWord = "hit", endWord = "cog"'], constraints: ['1 <= wordList.length <= 5000'] }
    ]
};

/**
 * GET /api/practice/problems
 * Get practice problems for user's track and level
 */
router.get('/problems', auth, async (req, res) => {
    try {
        const { trackId, level } = req.query;
        
        // Get all problems and add status based on user progress
        const allProblems = [];
        
        Object.entries(DSA_PROBLEMS).forEach(([topic, problems]) => {
            problems.forEach(problem => {
                // Check user progress from database (mock for now)
                const userProgress = {}; // TODO: Query from database
                const status = userProgress[problem.id] || 'unsolved';
                
                allProblems.push({
                    ...problem,
                    status: status
                });
            });
        });
        
        res.json({
            success: true,
            problems: allProblems
        });
        
    } catch (error) {
        console.error('Get practice problems error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch practice problems'
        });
    }
});

/**
 * POST /api/practice/progress
 * Update user's problem solving progress
 */
router.post('/progress', auth, async (req, res) => {
    try {
        const { problemId, status, trackId } = req.body;
        const userId = req.user.id;
        
        // TODO: Save to database
        // For now, just acknowledge
        
        res.json({
            success: true,
            message: 'Progress updated successfully'
        });
        
    } catch (error) {
        console.error('Update practice progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update progress'
        });
    }
});

/**
 * GET /api/practice/stats
 * Get user's practice statistics
 */
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // TODO: Query from database
        const stats = {
            totalSolved: 0,
            totalUnlocked: 50,
            completionRate: 0,
            byTopic: {}
        };
        
        res.json({
            success: true,
            stats: stats
        });
        
    } catch (error) {
        console.error('Get practice stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;
