import unittest
from mock import createMock, Mock

class TestClass():
    def method1(self, param1, param2):
        pass
    def method2(self, arg1, arg2):
        pass

class MockTestCase(unittest.TestCase):
    def test_should_create_mock(self):
        test_mock = createMock()
        self.assertIsNotNone(test_mock, msg='test mock is None')
        self.assertIsInstance(test_mock, Mock)

    def test_should_create_mock_for_class(self):
        test_mock = createMock(TestClass)
        self.assertIsNotNone(test_mock)
        self.assertIsInstance(test_mock, Mock)

    def test_should_return_None_by_default(self):
        test_mock = createMock(TestClass)
        self.assertIsNone(test_mock.method1(1, "hi!"))

    def test_should_return_12(self):
        test_mock = createMock(TestClass)
        test_mock.when('method1', ('a', 'b'), return_value=12)
        self.assertEqual(test_mock.method1('a', 'b'), 12)
        self.assertIsNone(test_mock.method1(12))

    def test_should_return_hi(self):
        test_mock = createMock(TestClass)
        test_mock.when('method1', {'param1': 'iweyr', 'param2': 123}, return_value='hi')
        self.assertEqual(test_mock.method1(param1='iweyr', param2=123), 'hi')
        self.assertIsNone(test_mock.method1('ok'))

    def test_should_return_True_always(self):
        test_mock = createMock(TestClass)
        test_mock.when('method1', return_value=True)
        self.assertEqual(test_mock.method1(param1='iweyr', param2=123), True)
        self.assertEqual(test_mock.method1('ok'), True)
        self.assertEqual(test_mock.method1(), True)
        self.assertIsNone(test_mock.method2())

    def test_should_have_been_called(self):
        test_mock = createMock(TestClass)
        self.assertFalse(test_mock.has_been_called())
        test_mock.method1()
        self.assertTrue(test_mock.has_been_called())

    def test_should_reset_mock(self):
        test_mock = createMock(TestClass)
        test_mock.when('method1', return_value=True)
        self.assertTrue(test_mock.method1())
        self.assertTrue(test_mock.has_been_called())
        test_mock.reset()
        self.assertFalse(test_mock.has_been_called())
        self.assertIsNone(test_mock.method1())

    def test_should_count_times_has_been_called(self):
        test_mock = createMock(TestClass)
        self.assertFalse(test_mock.has_been_called())
        test_mock.method1()
        self.assertTrue(test_mock.has_been_called())
        test_mock.method2()
        self.assertTrue(test_mock.has_been_called(times=2))
        test_mock.method1('a', 'b')
        self.assertTrue(test_mock.has_been_called(times=3))



if __name__ == '__main__':
    unittest.main()
        

